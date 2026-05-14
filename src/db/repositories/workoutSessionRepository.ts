import { asc, desc, eq, inArray } from 'drizzle-orm';

import type { Workout } from '@src/core/entities/entities';
import { uid } from '@src/core/id';
import type {
    WorkoutSession,
    WorkoutSessionStats,
} from '@src/core/entities/workoutSession.interfaces';

import { db as productionDb } from '../client';
import {
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    workoutVersionsTable,
} from '../schema';
import {
    workoutSessionFromDbRow,
    workoutSessionsFromDbRows,
    workoutSessionToDbRow,
    type WorkoutSessionRow,
} from '../mappers/workoutSessionMapper';
import {
    workoutsByVersionIdFromDbRows,
    type WorkoutExerciseRow,
    type WorkoutVersionRow,
} from '../mappers/workoutMapper';
import {
    workoutRepositoryApi,
    type RepositoryDb,
    type WorkoutRepositoryApi,
} from './workoutRepository';
import { hasSameWorkoutContent } from '../mappers/workoutContent';

export interface CreateWorkoutSessionArgs {
    workout: Workout;
    sourceWorkoutVersionId?: string;
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}

const normalizeLimit = (limit: number): number =>
    Number.isInteger(limit) && limit > 0 ? limit : 5;

const resolveSessionDurationSec = (args: {
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}): number => {
    const { startedAtMs, endedAtMs, stats } = args;

    if (stats != null) {
        return (
            stats.totalWorkSec +
            stats.totalRestSec +
            (stats.totalPausedSec ?? 0) +
            (stats.totalBlockPauseSec ?? 0)
        );
    }

    return Math.round((endedAtMs - startedAtMs) / 1000);
};

export interface WorkoutSessionRepository {
    create: (args: CreateWorkoutSessionArgs) => WorkoutSession;
    getAll: () => WorkoutSession[];
    getRecent: (limit: number) => WorkoutSession[];
    getById: (id: string) => WorkoutSession | null;
    upsert: (session: WorkoutSession) => void;
    remove: (id: string) => void;
    clear: () => void;
    readExistingIds: (ids: string[]) => Set<string>;
}

export interface CreateWorkoutSessionRepositoryArgs {
    db: RepositoryDb;
    workoutRepositoryApi: WorkoutRepositoryApi;
}

export const createWorkoutSessionRepository = (
    factoryArgs: CreateWorkoutSessionRepositoryArgs,
): WorkoutSessionRepository => {
    const repositoryDb = factoryArgs.db;
    const {
        createWorkoutVersion,
        deleteWorkoutVersionIfOrphan,
        getWorkoutByVersionId,
        workoutRepository,
    } = factoryArgs.workoutRepositoryApi;

    const hydrateSession = (row: WorkoutSessionRow): WorkoutSession => {
        if (row.workoutVersionId === null) {
            throw new Error(`Missing workout version for session ${row.id}`);
        }

        const workoutContent = getWorkoutByVersionId(row.workoutVersionId);
        if (!workoutContent) {
            throw new Error(`Missing workout content for session ${row.id}`);
        }

        return workoutSessionFromDbRow(row, workoutContent);
    };

    const getExercisesForBlocks = (
        blockIds: string[],
    ): WorkoutExerciseRow[] =>
        blockIds.length > 0
            ? repositoryDb
                  .select()
                  .from(workoutExercisesTable)
                  .where(inArray(workoutExercisesTable.blockId, blockIds))
                  .orderBy(asc(workoutExercisesTable.sortIndex))
                  .all()
            : [];

    const hydrateSessions = (rows: WorkoutSessionRow[]): WorkoutSession[] => {
        if (rows.length === 0) return [];

        const versionIds = Array.from(
            new Set(
                rows.flatMap((row) =>
                    row.workoutVersionId === null
                        ? []
                        : [row.workoutVersionId],
                ),
            ),
        );

        if (versionIds.length === 0) {
            throw new Error('Missing workout versions for session rows');
        }

        const versionRows: WorkoutVersionRow[] = repositoryDb
            .select()
            .from(workoutVersionsTable)
            .where(inArray(workoutVersionsTable.id, versionIds))
            .all();
        const blockRows = repositoryDb
            .select()
            .from(workoutBlocksTable)
            .where(inArray(workoutBlocksTable.workoutVersionId, versionIds))
            .orderBy(asc(workoutBlocksTable.sortIndex))
            .all();
        const exerciseRows = getExercisesForBlocks(
            blockRows.map((block) => block.id),
        );
        const workoutsByVersionId = workoutsByVersionIdFromDbRows(
            versionRows,
            blockRows,
            exerciseRows,
        );

        return workoutSessionsFromDbRows(rows, workoutsByVersionId);
    };

    const resolveWorkoutVersionId = (session: WorkoutSession): string => {
        if (session.workoutVersionId && session.workoutVersionId.length > 0) {
            return session.workoutVersionId;
        }

        if (session.workoutId) {
            const currentVersionId = workoutRepository.getCurrentVersionId(
                session.workoutId,
            );
            if (currentVersionId) return currentVersionId;
        }

        return createWorkoutVersion(session.workoutSnapshot, null);
    };

    const buildWorkoutSession = (
        buildArgs: CreateWorkoutSessionArgs,
    ): WorkoutSession => {
        const endedAtMs = Math.max(buildArgs.endedAtMs, buildArgs.startedAtMs);
        const workoutSnapshot: Workout = {
            ...buildArgs.workout,
            updatedAtMs: Number.isFinite(buildArgs.workout.updatedAtMs)
                ? buildArgs.workout.updatedAtMs
                : endedAtMs,
        };
        const sourceVersionWorkout = buildArgs.sourceWorkoutVersionId
            ? getWorkoutByVersionId(buildArgs.sourceWorkoutVersionId)
            : null;
        const workoutVersionId =
            sourceVersionWorkout !== null &&
            hasSameWorkoutContent(sourceVersionWorkout, workoutSnapshot)
                ? buildArgs.sourceWorkoutVersionId
                : undefined;

        return {
            id: uid(),
            startedAtMs: buildArgs.startedAtMs,
            endedAtMs,
            workoutSnapshot,
            workoutId: workoutRepository.getCurrentVersionId(
                buildArgs.workout.id,
            )
                ? buildArgs.workout.id
                : undefined,
            workoutVersionId,
            workoutNameSnapshot: workoutSnapshot.name,
            totalDurationSec: resolveSessionDurationSec({
                startedAtMs: buildArgs.startedAtMs,
                endedAtMs,
                stats: buildArgs.stats,
            }),
            stats: buildArgs.stats,
        };
    };

    const workoutSessionRepository: WorkoutSessionRepository = {
        create: (createArgs: CreateWorkoutSessionArgs): WorkoutSession => {
            const session = buildWorkoutSession(createArgs);
            workoutSessionRepository.upsert(session);
            return session;
        },

        getAll: (): WorkoutSession[] => {
            const rows = repositoryDb
                .select()
                .from(workoutSessionsTable)
                .orderBy(desc(workoutSessionsTable.endedAtMs))
                .all();

            return hydrateSessions(rows);
        },

        getRecent: (limit: number): WorkoutSession[] => {
            const rows = repositoryDb
                .select()
                .from(workoutSessionsTable)
                .orderBy(desc(workoutSessionsTable.endedAtMs))
                .limit(normalizeLimit(limit))
                .all();

            return hydrateSessions(rows);
        },

        getById: (id: string): WorkoutSession | null => {
            const row = repositoryDb
                .select()
                .from(workoutSessionsTable)
                .where(eq(workoutSessionsTable.id, id))
                .get();

            return row ? hydrateSession(row) : null;
        },

        upsert: (session: WorkoutSession): void => {
            const workoutId =
                session.workoutId &&
                workoutRepository.getCurrentVersionId(session.workoutId) !== null
                    ? session.workoutId
                    : undefined;
            const nextSession: WorkoutSession & { workoutVersionId: string } = {
                ...session,
                workoutId,
                workoutVersionId: resolveWorkoutVersionId(session),
            };
            const row = workoutSessionToDbRow(nextSession);

            repositoryDb
                .insert(workoutSessionsTable)
                .values(row)
                .onConflictDoUpdate({
                    target: workoutSessionsTable.id,
                    set: row,
                })
                .run();
        },

        remove: (id: string): void => {
            const row = repositoryDb
                .select({
                    workoutVersionId: workoutSessionsTable.workoutVersionId,
                })
                .from(workoutSessionsTable)
                .where(eq(workoutSessionsTable.id, id))
                .get();

            repositoryDb
                .delete(workoutSessionsTable)
                .where(eq(workoutSessionsTable.id, id))
                .run();

            if (row?.workoutVersionId) {
                deleteWorkoutVersionIfOrphan(row.workoutVersionId);
            }
        },

        clear: (): void => {
            const rows = repositoryDb
                .select({
                    workoutVersionId: workoutSessionsTable.workoutVersionId,
                })
                .from(workoutSessionsTable)
                .all();
            const versionIds = new Set(rows.map((row) => row.workoutVersionId));

            repositoryDb.delete(workoutSessionsTable).run();

            versionIds.forEach((versionId) => {
                deleteWorkoutVersionIfOrphan(versionId);
            });
        },

        readExistingIds: (ids: string[]): Set<string> => {
            if (ids.length === 0) return new Set<string>();

            const rows = repositoryDb
                .select({ id: workoutSessionsTable.id })
                .from(workoutSessionsTable)
                .where(inArray(workoutSessionsTable.id, ids))
                .all();

            return new Set(rows.map((row) => row.id));
        },
    };

    return workoutSessionRepository;
};

export const workoutSessionRepository = createWorkoutSessionRepository({
    db: productionDb,
    workoutRepositoryApi,
});
