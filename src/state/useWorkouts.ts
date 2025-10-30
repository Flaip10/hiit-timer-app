import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid/non-secure';
import type { Workout, WorkoutBlock, Pace } from '../core/entities';

type WorkoutsState = {
    workouts: Record<string, Workout>;
    order: string[];
    add: (w: Workout) => string;
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

export const useWorkouts = create<WorkoutsState>((set, get) => ({
    workouts: {},
    order: [],
    add: (w) => {
        const id = w.id ?? uid();
        const workout: Workout = { ...w, id };
        set((s) => ({
            workouts: { ...s.workouts, [id]: workout },
            order: [id, ...s.order.filter((x) => x !== id)],
        }));
        return id;
    },
    update: (id, patch) =>
        set((s) => {
            const cur = s.workouts[id];
            if (!cur) return s;
            const next: Workout = {
                ...cur,
                ...patch,
                blocks: patch.blocks ?? cur.blocks,
            };
            return { ...s, workouts: { ...s.workouts, [id]: next } };
        }),
    remove: (id) =>
        set((s) => {
            const { [id]: _, ...rest } = s.workouts;
            return { workouts: rest, order: s.order.filter((x) => x !== id) };
        }),
}));

export const useAllWorkouts = () =>
    useWorkouts(
        useShallow(
            (s) =>
                s.order.map((id) => s.workouts[id]).filter(Boolean) as Workout[]
        )
    );

export const useWorkout = (id?: string) =>
    useWorkouts((s) => (id ? s.workouts[id] : undefined));

export const ensureStarter = (): void => {
    const { workouts, add } = useWorkouts.getState();
    if (Object.keys(workouts).length === 0) add(starterWorkout());
};
