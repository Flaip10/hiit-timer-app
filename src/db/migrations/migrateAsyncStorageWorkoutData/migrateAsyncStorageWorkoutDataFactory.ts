import type { Workout } from '@src/core/entities/entities';
import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';
import { uid } from '@src/core/id';

import {
    isRecord,
    isWorkout,
    isWorkoutSession,
} from '../../mappers/jsonGuards';
import { createWorkoutContentKey } from '../../mappers/workouts/workoutContent';
import type { ExerciseDefinitionService } from '../../services/exerciseDefinitions/exerciseDefinitionServiceFactory';
import type {
    WorkoutRepository,
    RepositoryDb,
} from '../../repositories/workouts/workoutRepositoryFactory';
import type { WorkoutSessionRepository } from '../../repositories/workoutSessions/workoutSessionRepositoryFactory';
import {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    workoutVersionsTable,
    workoutsTable,
} from '../../schema';

const WORKOUTS_STORAGE_KEY = 'workouts-storage';
const WORKOUT_HISTORY_STORAGE_KEY = 'workout-history-storage-v1';
const SQLITE_WORKOUT_MIGRATION_KEY = 'sqlite-workout-migration-v1';

export interface MigrationAsyncStorage {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
}

export interface MigrationContext {
    asyncStorage: MigrationAsyncStorage;
    db: RepositoryDb;
    exerciseDefinitionService: ExerciseDefinitionService;
    workoutRepository: WorkoutRepository;
    workoutSessionRepository: WorkoutSessionRepository;
}

export interface MigrationCounts {
    workouts: number;
    sessions: number;
}

export interface AsyncStorageWorkoutMigrationResult {
    didRun: boolean;
    counts: MigrationCounts;
}

interface VersionByContentEntry {
    versionId: string;
    workoutId: string | null;
}

interface LegacyWorkoutSession extends WorkoutSession {
    workoutId?: string;
}

const readPersistedState = (raw: string | null): unknown | null => {
    if (raw === null) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;

    return parsed.state ?? null;
};

const readPersistedWorkouts = (raw: string | null): Record<string, Workout> => {
    const state = readPersistedState(raw);
    if (!isRecord(state)) return {};

    const workouts: Record<string, Workout> = {};
    const sourceWorkouts = isRecord(state.workouts) ? state.workouts : {};

    Object.entries(sourceWorkouts).forEach(([id, workout]) => {
        if (isWorkout(workout) && workout.id === id) {
            workouts[id] = workout;
        }
    });

    return workouts;
};

const readPersistedWorkoutHistory = (
    raw: string | null,
): Record<string, LegacyWorkoutSession> => {
    const state = readPersistedState(raw);
    if (!isRecord(state)) return {};

    const sessions: Record<string, LegacyWorkoutSession> = {};
    const sourceSessions = isRecord(state.sessions) ? state.sessions : {};

    Object.entries(sourceSessions).forEach(([id, session]) => {
        if (isWorkoutSession(session) && session.id === id) {
            sessions[id] = session;
        }
    });

    return sessions;
};

const assertAllIdsWereCopied = (args: {
    label: string;
    expectedIds: string[];
    actualIds: Set<string>;
}): void => {
    const missingIds = args.expectedIds.filter((id) => !args.actualIds.has(id));
    if (missingIds.length > 0) {
        throw new Error(
            `${args.label} migration verification failed for ${missingIds.length} ids`,
        );
    }
};

const resetWorkoutTables = (db: RepositoryDb): void => {
    db.transaction((transaction) => {
        transaction.delete(workoutSessionsTable).run();
        transaction.delete(workoutExercisesTable).run();
        transaction.delete(workoutBlocksTable).run();
        transaction.delete(workoutsTable).run();
        transaction.delete(workoutVersionsTable).run();
    });
};

const resolveMigratedSessionWorkoutId = (args: {
    session: LegacyWorkoutSession;
    activeWorkoutIds: Set<string>;
}): string | undefined => {
    const { session, activeWorkoutIds } = args;

    if (!session.workoutId) return undefined;

    return activeWorkoutIds.has(session.workoutId)
        ? session.workoutId
        : undefined;
};

const addVersionByContentEntry = (args: {
    entriesByContent: Map<string, VersionByContentEntry[]>;
    contentKey: string;
    entry: VersionByContentEntry;
}): void => {
    const currentEntries = args.entriesByContent.get(args.contentKey) ?? [];

    args.entriesByContent.set(args.contentKey, [...currentEntries, args.entry]);
};

const findReusableVersionId = (args: {
    entriesByContent: Map<string, VersionByContentEntry[]>;
    contentKey: string;
    workoutId?: string;
}): string | undefined => {
    const entries = args.entriesByContent.get(args.contentKey) ?? [];

    return entries.find(
        (entry) =>
            entry.workoutId === null || entry.workoutId === args.workoutId,
    )?.versionId;
};

export const createAsyncStorageMigration =
    (context: MigrationContext) =>
    async (): Promise<AsyncStorageWorkoutMigrationResult> => {
        const {
            asyncStorage,
            db,
            exerciseDefinitionService,
            workoutRepository,
            workoutSessionRepository,
        } = context;

        const [workoutsRaw, historyRaw, existingMarker] = await Promise.all([
            asyncStorage.getItem(WORKOUTS_STORAGE_KEY),
            asyncStorage.getItem(WORKOUT_HISTORY_STORAGE_KEY),
            asyncStorage.getItem(SQLITE_WORKOUT_MIGRATION_KEY),
        ]);

        if (existingMarker !== null) {
            return {
                didRun: false,
                counts: { workouts: 0, sessions: 0 },
            };
        }

        const persistedWorkouts = readPersistedWorkouts(workoutsRaw);
        const persistedHistory = readPersistedWorkoutHistory(historyRaw);

        resetWorkoutTables(db);

        const workoutIds = Object.keys(persistedWorkouts);
        const sessionIds = Object.keys(persistedHistory);
        const entriesByContent = new Map<string, VersionByContentEntry[]>();

        workoutIds.forEach((id, index) => {
            const workout = persistedWorkouts[id];
            const resolvedWorkout =
                exerciseDefinitionService.resolveWorkoutExerciseDefinitions(
                    workout,
                );
            const currentVersionId = uid();

            workoutRepository.insertWorkoutVersion(
                resolvedWorkout,
                currentVersionId,
            );
            workoutRepository.insertWorkout({
                id,
                name: resolvedWorkout.name,
                currentVersionId,
                createdAtMs: resolvedWorkout.updatedAtMs,
                isFavorite: resolvedWorkout.isFavorite === true,
                sortIndex: index,
            });
            addVersionByContentEntry({
                entriesByContent,
                contentKey: createWorkoutContentKey(resolvedWorkout),
                entry: {
                    versionId: currentVersionId,
                    workoutId: id,
                },
            });
        });

        const activeWorkoutIds = workoutRepository.readExistingIds(workoutIds);

        sessionIds.forEach((id) => {
            const session = persistedHistory[id];
            const workoutSnapshot =
                exerciseDefinitionService.resolveWorkoutExerciseDefinitions(
                    session.workoutSnapshot,
                );
            const contentKey = createWorkoutContentKey(workoutSnapshot);
            const workoutId = resolveMigratedSessionWorkoutId({
                session,
                activeWorkoutIds,
            });
            const existingVersionId = findReusableVersionId({
                entriesByContent,
                contentKey,
                workoutId,
            });
            const workoutVersionId =
                existingVersionId ??
                workoutRepository.createWorkoutVersion(workoutSnapshot);

            const sessionToMigrate: WorkoutSession = {
                id: session.id,
                startedAtMs: session.startedAtMs,
                endedAtMs: session.endedAtMs,
                workoutSnapshot,
                workoutVersionId,
                workoutNameSnapshot:
                    session.workoutNameSnapshot ?? workoutSnapshot.name,
                totalDurationSec: session.totalDurationSec,
                stats: session.stats,
            };

            workoutSessionRepository.insertSession({
                ...sessionToMigrate,
                workoutVersionId,
            });

            if (existingVersionId === undefined) {
                addVersionByContentEntry({
                    entriesByContent,
                    contentKey,
                    entry: {
                        versionId: workoutVersionId,
                        workoutId: workoutId ?? null,
                    },
                });
            }
        });

        assertAllIdsWereCopied({
            label: 'Workout',
            expectedIds: workoutIds,
            actualIds: workoutRepository.readExistingIds(workoutIds),
        });
        assertAllIdsWereCopied({
            label: 'Workout session',
            expectedIds: sessionIds,
            actualIds: workoutSessionRepository.readExistingIds(sessionIds),
        });

        const counts = {
            workouts: workoutIds.length,
            sessions: sessionIds.length,
        };

        await asyncStorage.setItem(
            SQLITE_WORKOUT_MIGRATION_KEY,
            JSON.stringify({
                migratedAtMs: Date.now(),
                counts,
            }),
        );

        return {
            didRun: true,
            counts,
        };
    };
