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

export type WorkoutSessionRow = typeof workoutSessionsTable.$inferSelect;

export const workoutSessionToDbRow = (
    session: PersistedWorkoutSession,
): typeof workoutSessionsTable.$inferInsert => ({
    id: session.id,
    startedAtMs: session.startedAtMs,
    endedAtMs: session.endedAtMs,
    workoutVersionId: session.workoutVersionId,
    workoutNameSnapshot: session.workoutNameSnapshot ?? null,
    totalDurationSec: session.totalDurationSec ?? null,
    statsJson: session.stats ? JSON.stringify(session.stats) : null,
});

const parseWorkoutSessionStats = (
    row: WorkoutSessionRow,
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
    workoutContent: Workout,
    activeWorkoutId?: string,
): WorkoutSession => ({
    id: row.id,
    startedAtMs: row.startedAtMs,
    endedAtMs: row.endedAtMs,
    workoutSnapshot: workoutContent,
    activeWorkoutId,
    workoutVersionId: row.workoutVersionId,
    workoutNameSnapshot: row.workoutNameSnapshot ?? undefined,
    totalDurationSec: row.totalDurationSec ?? undefined,
    stats: parseWorkoutSessionStats(row),
});
