import type {
    WorkoutSession,
    WorkoutSessionStats,
} from '@src/core/entities/workoutSession.interfaces';
import type { Workout } from '@src/core/entities/entities';

import type { workoutSessionsTable } from '../schema';
import {
    isWorkout,
    isWorkoutSessionStats,
} from './jsonGuards';

export interface WorkoutSessionRow {
    id: string;
    startedAtMs: number;
    endedAtMs: number;
    workoutId: string | null;
    workoutNameSnapshot: string | null;
    totalDurationSec: number | null;
    workoutSnapshotJson: string;
    statsJson: string | null;
    sortIndex: number;
}

export const workoutSessionToDbRow = (
    session: WorkoutSession,
    sortIndex: number
): typeof workoutSessionsTable.$inferInsert => ({
    id: session.id,
    startedAtMs: session.startedAtMs,
    endedAtMs: session.endedAtMs,
    workoutId: session.workoutId ?? null,
    workoutNameSnapshot: session.workoutNameSnapshot ?? null,
    totalDurationSec: session.totalDurationSec ?? null,
    workoutSnapshotJson: JSON.stringify(session.workoutSnapshot),
    statsJson: session.stats ? JSON.stringify(session.stats) : null,
    sortIndex,
});

export const workoutSessionFromDbRow = (
    row: WorkoutSessionRow
): WorkoutSession => {
    const workoutSnapshotUnknown = JSON.parse(row.workoutSnapshotJson) as unknown;
    if (!isWorkout(workoutSnapshotUnknown)) {
        throw new Error(`Invalid workout snapshot for session ${row.id}`);
    }

    let stats: WorkoutSessionStats | undefined;
    if (row.statsJson != null) {
        const statsUnknown = JSON.parse(row.statsJson) as unknown;
        if (!isWorkoutSessionStats(statsUnknown)) {
            throw new Error(`Invalid stats for session ${row.id}`);
        }
        stats = statsUnknown;
    }

    const workoutSnapshot: Workout = workoutSnapshotUnknown;

    return {
        id: row.id,
        startedAtMs: row.startedAtMs,
        endedAtMs: row.endedAtMs,
        workoutSnapshot,
        workoutId: row.workoutId ?? undefined,
        workoutNameSnapshot: row.workoutNameSnapshot ?? undefined,
        totalDurationSec: row.totalDurationSec ?? undefined,
        stats,
    };
};
