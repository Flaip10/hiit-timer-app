import { asc, desc, eq, inArray } from 'drizzle-orm';

import type { Workout } from '@src/core/entities/entities';
import { uid } from '@src/core/id';
import type {
    WorkoutSession,
    WorkoutSessionStats,
} from '@src/core/entities/workoutSession.interfaces';

import { db } from '../client';
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
    createWorkoutVersion,
    deleteWorkoutVersionIfOrphan,
    getWorkoutByVersionId,
    workoutRepository,
} from './workoutRepository';

export interface CreateWorkoutSessionArgs {
    workout: Workout;
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}

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

const normalizeLimit = (limit: number): number =>
    Number.isInteger(limit) && limit > 0 ? limit : 5;

const getExercisesForBlocks = (blockIds: string[]): WorkoutExerciseRow[] =>
    blockIds.length > 0
        ? db
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
                row.workoutVersionId === null ? [] : [row.workoutVersionId],
            ),
        ),
    );

    if (versionIds.length === 0) {
        throw new Error('Missing workout versions for session rows');
    }

    const versionRows: WorkoutVersionRow[] = db
        .select()
        .from(workoutVersionsTable)
        .where(inArray(workoutVersionsTable.id, versionIds))
        .all();
    const blockRows = db
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
    args: CreateWorkoutSessionArgs,
): WorkoutSession => {
    const endedAtMs = Math.max(args.endedAtMs, args.startedAtMs);
    const workoutSnapshot: Workout = {
        ...args.workout,
        updatedAtMs: Number.isFinite(args.workout.updatedAtMs)
            ? args.workout.updatedAtMs
            : endedAtMs,
    };

    return {
        id: uid(),
        startedAtMs: args.startedAtMs,
        endedAtMs,
        workoutSnapshot,
        workoutId: workoutRepository.getCurrentVersionId(args.workout.id)
            ? args.workout.id
            : undefined,
        workoutNameSnapshot: workoutSnapshot.name,
        totalDurationSec: resolveSessionDurationSec({
            startedAtMs: args.startedAtMs,
            endedAtMs,
            stats: args.stats,
        }),
        stats: args.stats,
    };
};

export const workoutSessionRepository = {
    create: (args: CreateWorkoutSessionArgs): WorkoutSession => {
        const session = buildWorkoutSession(args);
        workoutSessionRepository.upsert(session);
        return session;
    },

    getAll: (): WorkoutSession[] => {
        const rows = db
            .select()
            .from(workoutSessionsTable)
            .orderBy(desc(workoutSessionsTable.endedAtMs))
            .all();

        return hydrateSessions(rows);
    },

    getRecent: (limit: number): WorkoutSession[] => {
        const rows = db
            .select()
            .from(workoutSessionsTable)
            .orderBy(desc(workoutSessionsTable.endedAtMs))
            .limit(normalizeLimit(limit))
            .all();

        return hydrateSessions(rows);
    },

    getById: (id: string): WorkoutSession | null => {
        const row = db
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

        db.insert(workoutSessionsTable)
            .values(row)
            .onConflictDoUpdate({
                target: workoutSessionsTable.id,
                set: row,
            })
            .run();
    },

    remove: (id: string): void => {
        const row = db
            .select({ workoutVersionId: workoutSessionsTable.workoutVersionId })
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, id))
            .get();

        db.delete(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, id))
            .run();

        if (row?.workoutVersionId) {
            deleteWorkoutVersionIfOrphan(row.workoutVersionId);
        }
    },

    clear: (): void => {
        const rows = db
            .select({ workoutVersionId: workoutSessionsTable.workoutVersionId })
            .from(workoutSessionsTable)
            .all();
        const versionIds = new Set(rows.map((row) => row.workoutVersionId));

        db.delete(workoutSessionsTable).run();

        versionIds.forEach((versionId) => {
            deleteWorkoutVersionIfOrphan(versionId);
        });
    },

    readExistingIds: (ids: string[]): Set<string> => {
        if (ids.length === 0) return new Set<string>();

        const rows = db
            .select({ id: workoutSessionsTable.id })
            .from(workoutSessionsTable)
            .where(inArray(workoutSessionsTable.id, ids))
            .all();

        return new Set(rows.map((row) => row.id));
    },
};
