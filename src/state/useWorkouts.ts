import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Workout } from '../core/entities';
import { uid } from '../core/id';

type WorkoutsState = {
    workouts: Record<string, Workout>;
    order: string[];
    add: (w: Omit<Workout, 'id'> & Partial<Pick<Workout, 'id'>>) => string;
    update: (id: string, patch: Partial<Workout>) => void;
    remove: (id: string) => void;
    duplicate: (id: string) => string | null;
    clear: () => void;
};

export const useWorkouts = create<WorkoutsState>()(
    persist(
        (set, get) => ({
            workouts: {},
            order: [],

            add: (w) => {
                const id = w.id ?? uid();
                const workout: Workout = { id, name: w.name, blocks: w.blocks };
                set((s) => ({
                    workouts: { ...s.workouts, [id]: workout },
                    order: [id, ...s.order],
                }));
                return id;
            },

            update: (id, patch) => {
                set((s) => {
                    const prev = s.workouts[id];
                    if (!prev) return s;
                    const next: Workout = { ...prev, ...patch };
                    return { workouts: { ...s.workouts, [id]: next } };
                });
            },

            remove: (id) => {
                set((s) => {
                    const { [id]: _, ...rest } = s.workouts;
                    return {
                        workouts: rest,
                        order: s.order.filter((x) => x !== id),
                    };
                });
            },

            duplicate: (id) => {
                const src = get().workouts[id];
                if (!src) return null;
                const newId = uid();
                const clone: Workout = {
                    ...src,
                    id: newId,
                    name: `${src.name} (copy)`,
                    blocks: src.blocks.map((b) => ({
                        ...b,
                        id: uid(),
                        exercises: b.exercises.map((e) => ({
                            ...e,
                            id: uid(),
                        })),
                    })),
                };
                set((s) => ({
                    workouts: { ...s.workouts, [newId]: clone },
                    order: [newId, ...s.order],
                }));
                return newId;
            },

            clear: () => set({ workouts: {}, order: [] }),
        }),
        {
            name: 'pace.workouts.v1',
            storage: createJSONStorage(() => AsyncStorage),
            version: 1,
        }
    )
);

// selectors
export const useAllWorkouts = () =>
    useWorkouts(
        useShallow(
            (s) =>
                s.order.map((id) => s.workouts[id]).filter(Boolean) as Workout[]
        )
    );

export const useWorkout = (id?: string) =>
    useWorkouts((s) => (id ? s.workouts[id] : undefined));
