import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '@src/core/entities/entities';
import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';

import { db } from '../client';
import { createWorkoutContentKey } from '../mappers/workoutContent';
import { isRecord, isWorkout, isWorkoutSession } from '../mappers/jsonGuards';
import {
    createWorkoutVersion,
    workoutRepository,
} from '../repositories/workoutRepository';
import { workoutSessionRepository } from '../repositories/workoutSessionRepository';
import {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    workoutVersionsTable,
    workoutsTable,
} from '../schema';

const WORKOUTS_STORAGE_KEY = 'workouts-storage';
const WORKOUT_HISTORY_STORAGE_KEY = 'workout-history-storage-v1';
const SQLITE_WORKOUT_MIGRATION_KEY = 'sqlite-workout-migration-v1';

interface MigrationCounts {
    workouts: number;
    sessions: number;
}

interface VersionByContentEntry {
    versionId: string;
    workoutId: string | null;
}

export interface AsyncStorageWorkoutMigrationResult {
    didRun: boolean;
    counts: MigrationCounts;
}

const readPersistedState = (raw: string | null): unknown | null => {
    if (raw === null) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;

    return parsed.state ?? null;
};

const readPersistedWorkouts = (
    raw: string | null,
): Record<string, Workout> => {
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
): Record<string, WorkoutSession> => {
    const state = readPersistedState(raw);
    if (!isRecord(state)) return {};

    const sessions: Record<string, WorkoutSession> = {};
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

const writeMigrationMarker = async (counts: MigrationCounts): Promise<void> => {
    await AsyncStorage.setItem(
        SQLITE_WORKOUT_MIGRATION_KEY,
        JSON.stringify({
            migratedAtMs: Date.now(),
            counts,
        }),
    );
};

const resetWorkoutTables = (): void => {
    db.transaction((transaction) => {
        transaction.delete(workoutSessionsTable).run();
        transaction.delete(workoutExercisesTable).run();
        transaction.delete(workoutBlocksTable).run();
        transaction.delete(workoutsTable).run();
        transaction.delete(workoutVersionsTable).run();
    });
};

const resolveMigratedSessionWorkoutId = (args: {
    session: WorkoutSession;
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

    args.entriesByContent.set(args.contentKey, [
        ...currentEntries,
        args.entry,
    ]);
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

export const migrateAsyncStorageWorkoutData =
    async (): Promise<AsyncStorageWorkoutMigrationResult> => {
        const [workoutsRaw, historyRaw, existingMarker] = await Promise.all([
            AsyncStorage.getItem(WORKOUTS_STORAGE_KEY),
            AsyncStorage.getItem(WORKOUT_HISTORY_STORAGE_KEY),
            AsyncStorage.getItem(SQLITE_WORKOUT_MIGRATION_KEY),
        ]);

        if (existingMarker !== null) {
            return {
                didRun: false,
                counts: { workouts: 0, sessions: 0 },
            };
        }

        const persistedWorkouts = readPersistedWorkouts(workoutsRaw);
        const persistedHistory = readPersistedWorkoutHistory(historyRaw);

        resetWorkoutTables();

        const workoutIds = Object.keys(persistedWorkouts);
        const sessionIds = Object.keys(persistedHistory);
        const entriesByContent = new Map<string, VersionByContentEntry[]>();

        workoutIds.forEach((id, index) => {
            const workout = persistedWorkouts[id];

            workoutRepository.upsert(workout, index);

            const currentVersionId = workoutRepository.getCurrentVersionId(id);
            if (currentVersionId !== null) {
                addVersionByContentEntry({
                    entriesByContent,
                    contentKey: createWorkoutContentKey(workout),
                    entry: {
                        versionId: currentVersionId,
                        workoutId: id,
                    },
                });
            }
        });

        const activeWorkoutIds = workoutRepository.readExistingIds(workoutIds);

        sessionIds.forEach((id) => {
            const session = persistedHistory[id];
            const contentKey = createWorkoutContentKey(session.workoutSnapshot);
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
                createWorkoutVersion(
                    session.workoutSnapshot,
                    workoutId ?? null,
                );

            const sessionToMigrate: WorkoutSession = {
                ...session,
                workoutId,
                workoutVersionId,
                workoutNameSnapshot:
                    session.workoutNameSnapshot ?? session.workoutSnapshot.name,
            };

            workoutSessionRepository.upsert(sessionToMigrate);

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

        await writeMigrationMarker(counts);

        return {
            didRun: true,
            counts,
        };
    };
