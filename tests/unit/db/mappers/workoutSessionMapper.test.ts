import { describe, expect, it } from '@jest/globals';

import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';
import {
    workoutSessionFromDbRow,
    workoutSessionToDbRow,
} from '@src/db/mappers/workoutSessionMapper';
import {
    createSessionRowFixture,
    createSessionStatsFixture,
} from '../../../fixtures/sessions';
import { createQuickWorkoutFixture } from '../../../fixtures/workouts';

const workoutSnapshot = createQuickWorkoutFixture();
const stats = createSessionStatsFixture();

describe('workoutSessionToDbRow', () => {
    it('maps a persisted session to a DB row without storing workout JSON', () => {
        const session: WorkoutSession = {
            id: 'session-1',
            startedAtMs: 1_700_000_000_000,
            endedAtMs: 1_700_000_300_000,
            workoutVersionId: 'version-1',
            workoutNameSnapshot: workoutSnapshot.name,
            workoutSnapshot,
            totalDurationSec: 300,
            stats,
        };

        const row = workoutSessionToDbRow(session);

        expect(row).toEqual({
            id: session.id,
            startedAtMs: session.startedAtMs,
            endedAtMs: session.endedAtMs,
            workoutVersionId: session.workoutVersionId,
            workoutNameSnapshot: session.workoutNameSnapshot ?? null,
            totalDurationSec: session.totalDurationSec ?? null,
            statsJson: JSON.stringify(session.stats),
        });
        expect('workoutSnapshotJson' in row).toBe(false);
    });

    it('maps optional session values to nullable DB columns', () => {
        const session: WorkoutSession = {
            id: 'session-1',
            startedAtMs: 1_700_000_000_000,
            endedAtMs: 1_700_000_300_000,
            workoutVersionId: 'version-1',
            workoutSnapshot,
        };

        const row = workoutSessionToDbRow(session);

        expect(row).toMatchObject({
            workoutNameSnapshot: null,
            totalDurationSec: null,
            statsJson: null,
        });
    });
});

describe('workoutSessionFromDbRow', () => {
    it('hydrates a session with workout content supplied by version lookup', () => {
        const row = createSessionRowFixture();

        const session = workoutSessionFromDbRow(row, workoutSnapshot);

        expect(session).toEqual({
            id: row.id,
            startedAtMs: row.startedAtMs,
            endedAtMs: row.endedAtMs,
            activeWorkoutId: undefined,
            workoutVersionId: row.workoutVersionId,
            workoutNameSnapshot: row.workoutNameSnapshot ?? undefined,
            workoutSnapshot,
            totalDurationSec: row.totalDurationSec ?? undefined,
            stats,
        });
    });

    it('hydrates a session with an activeWorkoutId when supplied', () => {
        const row = createSessionRowFixture();
        const activeWorkoutId = 'active-workout-1';

        const session = workoutSessionFromDbRow(row, workoutSnapshot, activeWorkoutId);

        expect(session.activeWorkoutId).toBe(activeWorkoutId);
    });

    it('throws when a session row has invalid stats JSON shape', () => {
        const row = createSessionRowFixture({
            statsJson: JSON.stringify({ totalWorkSec: 120 }),
        });

        expect(() => workoutSessionFromDbRow(row, workoutSnapshot)).toThrow(
            `Invalid stats for session ${row.id}`,
        );
    });
});
