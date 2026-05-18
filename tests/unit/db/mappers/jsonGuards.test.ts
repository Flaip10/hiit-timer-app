import { describe, expect, it } from '@jest/globals';

import {
    isRecord,
    isStringList,
    isWorkout,
    isWorkoutBlock,
    isWorkoutExercise,
    isWorkoutSession,
    isWorkoutSessionStats,
} from '@src/db/mappers/jsonGuards';

// ---------------------------------------------------------------------------
// isRecord
// ---------------------------------------------------------------------------

describe('isRecord', () => {
    it('accepts a plain object', () => {
        expect(isRecord({})).toBe(true);
        expect(isRecord({ a: 1 })).toBe(true);
    });

    it('rejects null', () => expect(isRecord(null)).toBe(false));
    it('rejects arrays', () => expect(isRecord([])).toBe(false));
    it('rejects strings', () => expect(isRecord('x')).toBe(false));
    it('rejects numbers', () => expect(isRecord(42)).toBe(false));
    it('rejects undefined', () => expect(isRecord(undefined)).toBe(false));
});

// ---------------------------------------------------------------------------
// isStringList
// ---------------------------------------------------------------------------

describe('isStringList', () => {
    it('accepts an empty array', () => expect(isStringList([])).toBe(true));
    it('accepts a string array', () => expect(isStringList(['a', 'b'])).toBe(true));

    it('rejects a number array', () => expect(isStringList([1, 2])).toBe(false));
    it('rejects a mixed array', () => expect(isStringList(['a', 1])).toBe(false));
    it('rejects null', () => expect(isStringList(null)).toBe(false));
    it('rejects a plain object', () => expect(isStringList({})).toBe(false));
});

// ---------------------------------------------------------------------------
// isWorkoutExercise
// ---------------------------------------------------------------------------

describe('isWorkoutExercise', () => {
    const valid = { id: 'e1', mode: 'time', value: 30 };

    it('accepts a minimal time exercise', () => expect(isWorkoutExercise(valid)).toBe(true));

    it('accepts a reps exercise with all optional fields', () => {
        expect(isWorkoutExercise({
            id: 'e2',
            mode: 'reps',
            value: 12,
            name: 'Squat',
            exerciseDefinitionId: 'def-1',
            tempo: '3-1-3',
        })).toBe(true);
    });

    it('rejects non-record', () => expect(isWorkoutExercise('bad')).toBe(false));
    it('rejects missing id', () => expect(isWorkoutExercise({ mode: 'time', value: 30 })).toBe(false));
    it('rejects non-string id', () => expect(isWorkoutExercise({ id: 1, mode: 'time', value: 30 })).toBe(false));
    it('rejects missing mode', () => expect(isWorkoutExercise({ id: 'e1', value: 30 })).toBe(false));
    it('rejects invalid mode', () => expect(isWorkoutExercise({ id: 'e1', mode: 'invalid', value: 30 })).toBe(false));
    it('rejects missing value', () => expect(isWorkoutExercise({ id: 'e1', mode: 'time' })).toBe(false));
    it('rejects non-finite value', () => expect(isWorkoutExercise({ id: 'e1', mode: 'time', value: NaN })).toBe(false));
    it('rejects non-string name', () => expect(isWorkoutExercise({ ...valid, name: 99 })).toBe(false));
    it('rejects non-string exerciseDefinitionId', () => expect(isWorkoutExercise({ ...valid, exerciseDefinitionId: true })).toBe(false));
    it('rejects non-string tempo', () => expect(isWorkoutExercise({ ...valid, tempo: 123 })).toBe(false));
});

// ---------------------------------------------------------------------------
// isWorkoutBlock
// ---------------------------------------------------------------------------

describe('isWorkoutBlock', () => {
    const validExercise = { id: 'e1', mode: 'time', value: 30 };
    const valid = {
        id: 'b1',
        sets: 3,
        restBetweenSetsSec: 60,
        restBetweenExercisesSec: 15,
        exercises: [validExercise],
    };

    it('accepts a block with exercises', () => expect(isWorkoutBlock(valid)).toBe(true));

    it('accepts a block with an optional title', () => {
        expect(isWorkoutBlock({ ...valid, title: 'Warmup' })).toBe(true);
    });

    it('accepts a block with no exercises', () => {
        expect(isWorkoutBlock({ ...valid, exercises: [] })).toBe(true);
    });

    it('rejects non-record', () => expect(isWorkoutBlock(null)).toBe(false));
    it('rejects missing id', () => expect(isWorkoutBlock({ ...valid, id: undefined })).toBe(false));
    it('rejects missing sets', () => expect(isWorkoutBlock({ ...valid, sets: undefined })).toBe(false));
    it('rejects missing restBetweenSetsSec', () => expect(isWorkoutBlock({ ...valid, restBetweenSetsSec: undefined })).toBe(false));
    it('rejects missing restBetweenExercisesSec', () => expect(isWorkoutBlock({ ...valid, restBetweenExercisesSec: undefined })).toBe(false));
    it('rejects non-array exercises', () => expect(isWorkoutBlock({ ...valid, exercises: 'bad' })).toBe(false));
    it('rejects non-string title', () => expect(isWorkoutBlock({ ...valid, title: 42 })).toBe(false));
    it('rejects a block containing an invalid exercise', () => {
        expect(isWorkoutBlock({ ...valid, exercises: [{ id: 'e1', mode: 'bad', value: 30 }] })).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isWorkout
// ---------------------------------------------------------------------------

describe('isWorkout', () => {
    const validBlock = {
        id: 'b1',
        sets: 1,
        restBetweenSetsSec: 0,
        restBetweenExercisesSec: 0,
        exercises: [],
    };
    const valid = {
        id: 'w1',
        name: 'Leg Day',
        updatedAtMs: 1_700_000_000_000,
        blocks: [validBlock],
    };

    it('accepts a minimal workout', () => expect(isWorkout(valid)).toBe(true));

    it('accepts a workout with isFavorite', () => {
        expect(isWorkout({ ...valid, isFavorite: true })).toBe(true);
    });

    it('accepts a workout with no blocks', () => {
        expect(isWorkout({ ...valid, blocks: [] })).toBe(true);
    });

    it('rejects non-record', () => expect(isWorkout(42)).toBe(false));
    it('rejects missing id', () => expect(isWorkout({ ...valid, id: undefined })).toBe(false));
    it('rejects missing name', () => expect(isWorkout({ ...valid, name: undefined })).toBe(false));
    it('rejects missing updatedAtMs', () => expect(isWorkout({ ...valid, updatedAtMs: undefined })).toBe(false));
    it('rejects non-finite updatedAtMs', () => expect(isWorkout({ ...valid, updatedAtMs: Infinity })).toBe(false));
    it('rejects non-boolean isFavorite', () => expect(isWorkout({ ...valid, isFavorite: 'yes' })).toBe(false));
    it('rejects non-array blocks', () => expect(isWorkout({ ...valid, blocks: {} })).toBe(false));
    it('rejects a workout containing an invalid block', () => {
        expect(isWorkout({ ...valid, blocks: [{ id: 'b1', sets: 'bad', restBetweenSetsSec: 0, restBetweenExercisesSec: 0, exercises: [] }] })).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isWorkoutSessionStats
// ---------------------------------------------------------------------------

describe('isWorkoutSessionStats', () => {
    const valid = {
        completedSets: 3,
        completedExercises: 6,
        totalWorkSec: 120,
        totalRestSec: 60,
    };

    it('accepts minimal stats', () => expect(isWorkoutSessionStats(valid)).toBe(true));

    it('accepts stats with all optional fields', () => {
        expect(isWorkoutSessionStats({
            ...valid,
            totalPrepSec: 10,
            totalPausedSec: 5,
            totalBlockPauseSec: 2,
            completedSetsByBlock: [1, 2],
            completedExercisesByBlock: [2, 4],
            workSecByBlock: [60, 60],
            restSecByBlock: [30, 30],
            prepSecByBlock: [5, 5],
        })).toBe(true);
    });

    it('rejects non-record', () => expect(isWorkoutSessionStats(null)).toBe(false));
    it('rejects missing completedSets', () => expect(isWorkoutSessionStats({ ...valid, completedSets: undefined })).toBe(false));
    it('rejects missing completedExercises', () => expect(isWorkoutSessionStats({ ...valid, completedExercises: undefined })).toBe(false));
    it('rejects missing totalWorkSec', () => expect(isWorkoutSessionStats({ ...valid, totalWorkSec: undefined })).toBe(false));
    it('rejects missing totalRestSec', () => expect(isWorkoutSessionStats({ ...valid, totalRestSec: undefined })).toBe(false));
    it('rejects non-number totalPrepSec', () => expect(isWorkoutSessionStats({ ...valid, totalPrepSec: 'bad' })).toBe(false));
    it('rejects non-number totalPausedSec', () => expect(isWorkoutSessionStats({ ...valid, totalPausedSec: true })).toBe(false));
    it('rejects non-number-array completedSetsByBlock', () => expect(isWorkoutSessionStats({ ...valid, completedSetsByBlock: ['a'] })).toBe(false));
    it('rejects non-number-array workSecByBlock', () => expect(isWorkoutSessionStats({ ...valid, workSecByBlock: [60, 'bad'] })).toBe(false));
});

// ---------------------------------------------------------------------------
// isWorkoutSession
// ---------------------------------------------------------------------------

describe('isWorkoutSession', () => {
    const validWorkout = {
        id: 'version-1',
        name: 'Test',
        updatedAtMs: 1_700_000_000_000,
        blocks: [],
    };
    const valid = {
        id: 's1',
        startedAtMs: 100,
        endedAtMs: 400,
        workoutSnapshot: validWorkout,
    };

    it('accepts a minimal session', () => expect(isWorkoutSession(valid)).toBe(true));

    it('accepts a session with all optional fields', () => {
        expect(isWorkoutSession({
            ...valid,
            activeWorkoutId: 'w1',
            workoutVersionId: 'version-1',
            workoutNameSnapshot: 'Test',
            totalDurationSec: 300,
            stats: { completedSets: 1, completedExercises: 2, totalWorkSec: 60, totalRestSec: 30 },
        })).toBe(true);
    });

    it('rejects non-record', () => expect(isWorkoutSession('bad')).toBe(false));
    it('rejects missing id', () => expect(isWorkoutSession({ ...valid, id: undefined })).toBe(false));
    it('rejects missing startedAtMs', () => expect(isWorkoutSession({ ...valid, startedAtMs: undefined })).toBe(false));
    it('rejects missing endedAtMs', () => expect(isWorkoutSession({ ...valid, endedAtMs: undefined })).toBe(false));
    it('rejects missing workoutSnapshot', () => expect(isWorkoutSession({ ...valid, workoutSnapshot: undefined })).toBe(false));
    it('rejects an invalid workoutSnapshot', () => expect(isWorkoutSession({ ...valid, workoutSnapshot: { id: 'v1' } })).toBe(false));
    it('rejects non-string activeWorkoutId', () => expect(isWorkoutSession({ ...valid, activeWorkoutId: 123 })).toBe(false));
    it('rejects non-string workoutVersionId', () => expect(isWorkoutSession({ ...valid, workoutVersionId: false })).toBe(false));
    it('rejects non-string workoutNameSnapshot', () => expect(isWorkoutSession({ ...valid, workoutNameSnapshot: [] })).toBe(false));
    it('rejects non-number totalDurationSec', () => expect(isWorkoutSession({ ...valid, totalDurationSec: '300' })).toBe(false));
    it('rejects invalid stats shape', () => expect(isWorkoutSession({ ...valid, stats: { completedSets: 1 } })).toBe(false));
});
