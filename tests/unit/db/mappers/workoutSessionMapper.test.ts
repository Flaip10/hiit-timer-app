import { describe, expect, it } from '@jest/globals';

import type { Workout } from '@src/core/entities/entities';
import type {
    WorkoutSession,
    WorkoutSessionStats,
} from '@src/core/entities/workoutSession.interfaces';
import {
    workoutSessionFromDbRow,
    workoutSessionsFromDbRows,
    workoutSessionToDbRow,
    type WorkoutSessionRow,
} from '@src/db/mappers/workoutSessionMapper';

const workoutContent: Workout = {
    id: 'version-1',
    name: 'Historical Workout',
    updatedAtMs: 1_700_000_000_000,
    blocks: [],
};

const stats: WorkoutSessionStats = {
    completedSets: 2,
    completedExercises: 4,
    totalWorkSec: 120,
    totalRestSec: 60,
    totalPausedSec: 10,
};

const createSessionRow = (
    overrides?: Partial<WorkoutSessionRow>
): WorkoutSessionRow => ({
    id: 'session-1',
    startedAtMs: 100,
    endedAtMs: 300,
    workoutId: 'workout-1',
    workoutVersionId: 'version-1',
    workoutNameSnapshot: 'Historical Workout',
    totalDurationSec: 200,
    statsJson: JSON.stringify(stats),
    ...overrides,
});

describe('workoutSessionToDbRow', () => {
    it('maps a persisted session to a DB row without storing workout JSON', () => {
        const session: WorkoutSession & { workoutVersionId: string } = {
            id: 'session-1',
            startedAtMs: 100,
            endedAtMs: 300,
            workoutId: 'workout-1',
            workoutVersionId: 'version-1',
            workoutNameSnapshot: 'Historical Workout',
            workoutSnapshot: workoutContent,
            totalDurationSec: 200,
            stats,
        };

        const row = workoutSessionToDbRow(session);

        expect(row).toEqual({
            id: 'session-1',
            startedAtMs: 100,
            endedAtMs: 300,
            workoutId: 'workout-1',
            workoutVersionId: 'version-1',
            workoutNameSnapshot: 'Historical Workout',
            totalDurationSec: 200,
            statsJson: JSON.stringify(stats),
        });
        expect('workoutSnapshotJson' in row).toBe(false);
    });

    it('maps optional session values to nullable DB columns', () => {
        const session: WorkoutSession & { workoutVersionId: string } = {
            id: 'session-1',
            startedAtMs: 100,
            endedAtMs: 300,
            workoutVersionId: 'version-1',
            workoutSnapshot: workoutContent,
        };

        const row = workoutSessionToDbRow(session);

        expect(row).toMatchObject({
            workoutId: null,
            workoutNameSnapshot: null,
            totalDurationSec: null,
            statsJson: null,
        });
    });
});

describe('workoutSessionFromDbRow', () => {
    it('hydrates a session with workout content supplied by version lookup', () => {
        const row = createSessionRow();

        const session = workoutSessionFromDbRow(row, workoutContent);

        expect(session).toEqual({
            id: 'session-1',
            startedAtMs: 100,
            endedAtMs: 300,
            workoutId: 'workout-1',
            workoutVersionId: 'version-1',
            workoutNameSnapshot: 'Historical Workout',
            workoutSnapshot: workoutContent,
            totalDurationSec: 200,
            stats,
        });
    });

    it('throws when a session row is missing workoutVersionId', () => {
        const row = createSessionRow({ workoutVersionId: null });

        expect(() => workoutSessionFromDbRow(row, workoutContent)).toThrow(
            'Missing workout version for session session-1'
        );
    });

    it('throws when a session row has invalid stats JSON shape', () => {
        const row = createSessionRow({
            statsJson: JSON.stringify({ totalWorkSec: 120 }),
        });

        expect(() => workoutSessionFromDbRow(row, workoutContent)).toThrow(
            'Invalid stats for session session-1'
        );
    });
});

describe('workoutSessionsFromDbRows', () => {
    it('hydrates multiple sessions from version-keyed workout content', () => {
        const rows: WorkoutSessionRow[] = [
            createSessionRow({ id: 'session-1', workoutVersionId: 'version-1' }),
            createSessionRow({
                id: 'session-2',
                workoutId: null,
                workoutVersionId: 'version-2',
                statsJson: null,
            }),
        ];
        const secondWorkoutContent: Workout = {
            id: 'version-2',
            name: 'Deleted Workout',
            updatedAtMs: 1_800_000_000_000,
            blocks: [],
        };
        const workoutsByVersionId = new Map<string, Workout>([
            ['version-1', workoutContent],
            ['version-2', secondWorkoutContent],
        ]);

        const sessions = workoutSessionsFromDbRows(rows, workoutsByVersionId);

        expect(sessions).toHaveLength(2);
        expect(sessions[0]?.workoutSnapshot).toBe(workoutContent);
        expect(sessions[1]?.workoutId).toBeUndefined();
        expect(sessions[1]?.workoutSnapshot).toBe(secondWorkoutContent);
        expect(sessions[1]?.stats).toBeUndefined();
    });

    it('throws when version-keyed workout content is unavailable', () => {
        const rows = [createSessionRow({ workoutVersionId: 'missing-version' })];

        expect(() => workoutSessionsFromDbRows(rows, new Map())).toThrow(
            'Missing workout content for session session-1'
        );
    });
});
