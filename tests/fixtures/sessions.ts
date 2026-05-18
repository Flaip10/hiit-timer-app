import type {
    WorkoutSession,
    WorkoutSessionStats,
} from '@src/core/entities/workoutSession.interfaces';
import type { WorkoutSessionRow } from '@src/db/mappers/workoutSessionMapper';

import { createQuickWorkoutFixture } from './workouts';

export const createSessionStatsFixture = (
    overrides: Partial<WorkoutSessionStats> = {},
): WorkoutSessionStats => ({
    completedSets: 3,
    completedExercises: 5,
    totalWorkSec: 210,
    totalRestSec: 90,
    ...overrides,
});

export interface SessionFixtureArgs {
    id?: string;
    startedAtMs?: number;
    totalDurationSec?: number;
    activeWorkoutId?: string;
    workoutVersionId?: string;
    workoutNameSnapshot?: string;
    stats?: WorkoutSessionStats;
}

export const createSessionFixture = (
    args: SessionFixtureArgs = {},
): WorkoutSession => {
    const workoutSnapshot = createQuickWorkoutFixture();
    const startedAtMs = args.startedAtMs ?? 1_700_000_000_000;
    const totalDurationSec = args.totalDurationSec ?? 300;

    return {
        id: args.id ?? 'session-1',
        startedAtMs,
        endedAtMs: startedAtMs + totalDurationSec * 1_000,
        workoutSnapshot,
        activeWorkoutId: args.activeWorkoutId,
        workoutVersionId: args.workoutVersionId ?? 'version-1',
        workoutNameSnapshot: args.workoutNameSnapshot ?? workoutSnapshot.name,
        totalDurationSec,
        stats: 'stats' in args ? args.stats : createSessionStatsFixture(),
    };
};

export const createSessionRowFixture = (
    overrides: Partial<WorkoutSessionRow> = {},
): WorkoutSessionRow => {
    const startedAtMs = overrides.startedAtMs ?? 1_700_000_000_000;

    return {
        id: 'session-1',
        startedAtMs,
        endedAtMs: startedAtMs + 300_000,
        workoutVersionId: 'version-1',
        workoutNameSnapshot: 'Quick Workout',
        totalDurationSec: 300,
        statsJson: JSON.stringify(createSessionStatsFixture()),
        ...overrides,
    };
};
