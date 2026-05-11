import type {
    WorkoutSession,
    WorkoutSessionStats,
} from '@src/core/entities/workoutSession.interfaces';
import type { Workout } from '@src/core/entities/entities';

import type { workoutSessionsTable } from '../schema';
import { isWorkoutSessionStats } from './jsonGuards';

interface PersistedWorkoutSession extends WorkoutSession {
    workoutVersionId: string;
}

export interface WorkoutSessionRow {
    id: string;
    startedAtMs: number;
    endedAtMs: number;
    workoutId: string | null;
    workoutVersionId: string | null;
    workoutNameSnapshot: string | null;
    totalDurationSec: number | null;
    statsJson: string | null;
}

export const workoutSessionToDbRow = (
    session: PersistedWorkoutSession
): typeof workoutSessionsTable.$inferInsert => ({
    id: session.id,
    startedAtMs: session.startedAtMs,
    endedAtMs: session.endedAtMs,
    workoutId: session.workoutId ?? null,
    workoutVersionId: session.workoutVersionId,
    workoutNameSnapshot: session.workoutNameSnapshot ?? null,
    totalDurationSec: session.totalDurationSec ?? null,
    statsJson: session.stats ? JSON.stringify(session.stats) : null,
});

const parseWorkoutSessionStats = (
    row: WorkoutSessionRow
): WorkoutSessionStats | undefined => {
    if (row.statsJson == null) return undefined;

    const statsUnknown = JSON.parse(row.statsJson) as unknown;
    if (!isWorkoutSessionStats(statsUnknown)) {
        throw new Error(`Invalid stats for session ${row.id}`);
    }

    return statsUnknown;
};

export const workoutSessionFromDbRow = (
    row: WorkoutSessionRow,
    workoutContent: Workout
): WorkoutSession => {
    if (row.workoutVersionId == null) {
        throw new Error(`Missing workout version for session ${row.id}`);
    }

    return {
        id: row.id,
        startedAtMs: row.startedAtMs,
        endedAtMs: row.endedAtMs,
        workoutSnapshot: workoutContent,
        workoutId: row.workoutId ?? undefined,
        workoutVersionId: row.workoutVersionId,
        workoutNameSnapshot: row.workoutNameSnapshot ?? undefined,
        totalDurationSec: row.totalDurationSec ?? undefined,
        stats: parseWorkoutSessionStats(row),
    };
};

export const workoutSessionsFromDbRows = (
    rows: WorkoutSessionRow[],
    workoutsByVersionId: Map<string, Workout>
): WorkoutSession[] =>
    rows.map((row) => {
        if (row.workoutVersionId == null) {
            throw new Error(`Missing workout version for session ${row.id}`);
        }

        const workoutContent = workoutsByVersionId.get(row.workoutVersionId);
        if (!workoutContent) {
            throw new Error(`Missing workout content for session ${row.id}`);
        }

        return workoutSessionFromDbRow(row, workoutContent);
    });
