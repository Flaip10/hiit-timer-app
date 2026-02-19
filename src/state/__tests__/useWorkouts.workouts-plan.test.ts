import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '@src/core/entities/entities';
import { useWorkouts } from '../useWorkouts';

interface AsyncStorageMock {
    clear: jest.Mock<Promise<void>, []>;
    setItem: jest.Mock<Promise<void>, [string, string]>;
}

const isAsyncStorageMock = (value: unknown): value is AsyncStorageMock => {
    if (typeof value !== 'object' || value === null) return false;

    const candidate = value as Partial<AsyncStorageMock>;

    return (
        typeof candidate.clear === 'function' &&
        typeof candidate.setItem === 'function'
    );
};

const getAsyncStorageMock = (): AsyncStorageMock => {
    const candidate: unknown = AsyncStorage;
    if (!isAsyncStorageMock(candidate)) {
        throw new Error('AsyncStorage mock shape does not match expected API.');
    }

    return candidate;
};

const flushPersistence = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
};

const resetWorkoutsStore = (): void => {
    useWorkouts.setState({
        workouts: {},
        order: [],
        draft: null,
    });
};

const createWorkout = (id: string, name: string): Workout => ({
    id,
    name,
    updatedAtMs: Date.now(),
    blocks: [
        {
            id: `${id}-block`,
            title: 'Block',
            sets: 3,
            restBetweenSetsSec: 20,
            restBetweenExercisesSec: 10,
            exercises: [
                {
                    id: `${id}-exercise`,
                    mode: 'time',
                    value: 30,
                },
            ],
        },
    ],
});

describe('useWorkouts - Workouts plan slice', () => {
    beforeEach(async () => {
        resetWorkoutsStore();
        const storage = getAsyncStorageMock();
        await storage.clear();
        jest.clearAllMocks();
    });

    it('WORK-017 + WORK-025 creates and commits a draft workout', () => {
        const store = useWorkouts.getState();

        store.startDraftNew();

        const startedDraft = useWorkouts.getState().draft;
        expect(startedDraft).not.toBeNull();
        expect(startedDraft?.blocks.length).toBeGreaterThan(0);

        store.updateDraftMeta({ name: 'Automation Demo Workout' });
        const committedId = store.commitDraft();

        expect(committedId).not.toBeNull();
        expect(typeof committedId).toBe('string');

        const committedState = useWorkouts.getState();
        expect(committedState.draft).toBeNull();
        expect(committedId ? committedState.workouts[committedId]?.name : null).toBe(
            'Automation Demo Workout'
        );
        expect(committedId ? committedState.order[0] : null).toBe(committedId);
    });

    it('WORK-005 + WORK-006 toggles favorite state on a workout', () => {
        const store = useWorkouts.getState();

        store.add(createWorkout('workout-1', 'Workout 1'));

        expect(useWorkouts.getState().workouts['workout-1']?.isFavorite).toBe(
            undefined
        );

        store.toggleFavorite('workout-1');
        expect(useWorkouts.getState().workouts['workout-1']?.isFavorite).toBe(
            true
        );

        store.toggleFavorite('workout-1');
        expect(useWorkouts.getState().workouts['workout-1']?.isFavorite).toBe(
            false
        );
    });

    it('WORK-028 does not persist draft data to storage', async () => {
        const store = useWorkouts.getState();
        const storage = getAsyncStorageMock();

        store.startDraftNew();

        await flushPersistence();

        const persistedPayloads = storage.setItem.mock.calls
            .filter(([key]) => key === 'workouts-storage')
            .map(([, value]) => value);

        expect(persistedPayloads.length).toBeGreaterThan(0);

        const latestPayload = persistedPayloads[persistedPayloads.length - 1];
        const parsed = JSON.parse(latestPayload) as {
            state: {
                workouts: Record<string, Workout>;
                order: string[];
                draft?: Workout | null;
            };
            version: number;
        };

        expect(parsed.state.draft).toBeUndefined();
        expect(parsed.state.workouts).toEqual({});
        expect(parsed.state.order).toEqual([]);
    });
});
