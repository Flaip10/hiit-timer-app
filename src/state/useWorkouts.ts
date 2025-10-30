import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid/non-secure';
import type { Workout, WorkoutBlock, Pace } from '../core/entities';

type WorkoutsState = {
    workouts: Record<string, Workout>;
    order: string[];
    add: (workout: Workout) => string;
    update: (id: string, patch: Partial<Workout>) => void;
    remove: (id: string) => void;
};

const uid = (): string => nanoid(12);

const starterBlock = (): WorkoutBlock => ({
    id: uid(),
    title: 'Basic HIIT',
    defaultPace: { type: 'time', workSec: 20 } as Pace,
    scheme: { sets: 6, restBetweenSetsSec: 20, restBetweenExercisesSec: 10 },
    advanced: false,
    exercises: [
        { id: uid(), name: 'Jumping Jacks' },
        { id: uid(), name: 'High Knees' },
        { id: uid(), name: 'Mountain Climbers' },
    ],
});

const starterWorkout = (): Workout => ({
    id: uid(),
    name: 'Starter',
    blocks: [starterBlock()],
});

export const useWorkouts = create<WorkoutsState>((set) => ({
    workouts: {},
    order: [],

    add: (workout) => {
        const id = workout.id ?? uid();
        const nextWorkout: Workout = { ...workout, id };

        set((state) => ({
            workouts: {
                ...state.workouts,
                [id]: nextWorkout,
            },
            order: [
                id,
                ...state.order.filter((existingId) => existingId !== id),
            ],
        }));

        return id;
    },

    update: (id, patch) =>
        set((state) => {
            const current = state.workouts[id];
            if (!current) return state;

            const next: Workout = {
                ...current,
                ...patch,
                blocks: patch.blocks ?? current.blocks,
            };

            return {
                ...state,
                workouts: {
                    ...state.workouts,
                    [id]: next,
                },
            };
        }),

    remove: (id) =>
        set((state) => {
            const { [id]: _removed, ...rest } = state.workouts;

            return {
                workouts: rest,
                order: state.order.filter((existingId) => existingId !== id),
            };
        }),
}));

export const useAllWorkouts = () =>
    useWorkouts(
        useShallow(
            (state) =>
                state.order
                    .map((id) => state.workouts[id])
                    .filter(Boolean) as Workout[]
        )
    );

export const useWorkout = (id?: string) =>
    useWorkouts((state) => (id ? state.workouts[id] : undefined));

export const ensureStarter = (): void => {
    const { workouts, add } = useWorkouts.getState();
    if (Object.keys(workouts).length === 0) add(starterWorkout());
};
