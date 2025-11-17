// src/state/useWorkouts.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid/non-secure';

import type { Workout, WorkoutBlock, Pace } from '@src/core/entities';

type WorkoutsState = {
    // saved workouts
    workouts: Record<string, Workout>;
    order: string[];

    // current draft (for create/edit flow)
    draft: Workout | null;

    // CRUD for real workouts
    add: (workout: Workout) => string;
    update: (id: string, patch: Partial<Workout>) => void;
    remove: (id: string) => void;

    // draft workflow
    startDraftNew: () => void;
    startDraftFromExisting: (id: string) => void;
    updateDraftMeta: (patch: Partial<Pick<Workout, 'name'>>) => void;
    updateDraftBlock: (blockId: string, patch: Partial<WorkoutBlock>) => void;
    setDraftBlocks: (blocks: WorkoutBlock[]) => void;
    commitDraft: () => string | null;
    clearDraft: () => void;
};

const uid = (): string => nanoid(12);

// --- templates ----------------------------------------------------

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

// “empty” draft workout used when creating a new one
const emptyDraftWorkout = (): Workout => ({
    id: uid(),
    name: 'New Workout',
    blocks: [],
});

// --- store --------------------------------------------------------

export const useWorkouts = create<WorkoutsState>()(
    immer((set, get) => ({
        workouts: {},
        order: [],
        draft: null,

        // ----- real workouts -----
        add: (workout) => {
            const id = workout.id ?? uid();
            const nextWorkout: Workout = { ...workout, id };

            set((state) => {
                state.workouts[id] = nextWorkout;
                state.order = [
                    id,
                    ...state.order.filter((x: string) => x !== id),
                ];
            });

            return id;
        },

        update: (id, patch) =>
            set((state) => {
                const current = state.workouts[id];
                if (!current) return;

                const next: Workout = {
                    ...current,
                    ...patch,
                    blocks: patch.blocks ?? current.blocks,
                };

                state.workouts[id] = next;
            }),

        remove: (id) =>
            set((state) => {
                const rest = { ...state.workouts };
                delete rest[id];
                state.workouts = rest;
                state.order = state.order.filter((x: string) => x !== id);
            }),

        // ----- draft workflow -----

        // start a brand new draft
        startDraftNew: () =>
            set(() => ({
                draft: emptyDraftWorkout(),
            })),

        // start from an existing workout (deep clone)
        startDraftFromExisting: (id) => {
            const { workouts } = get();
            const existing = workouts[id];
            if (!existing) return;

            const clone: Workout =
                typeof structuredClone === 'function'
                    ? structuredClone(existing)
                    : (JSON.parse(JSON.stringify(existing)) as Workout);

            // keep a new id or reuse? here we keep the same id so "save" overwrites
            set(() => ({
                draft: clone,
            }));
        },

        // patch top-level draft fields (currently name only)
        updateDraftMeta: (patch) =>
            set((state) => {
                if (!state.draft) return;
                Object.assign(state.draft, patch);
            }),

        // patch a single block inside the draft by blockId
        updateDraftBlock: (blockId, patch) =>
            set((state) => {
                if (!state.draft) return;
                const block = state.draft.blocks.find(
                    (b: WorkoutBlock) => b.id === blockId
                );
                if (!block) return;
                Object.assign(block, patch);
            }),

        // replace all draft blocks (e.g. when coming back from BlockEditScreen)
        setDraftBlocks: (blocks) =>
            set((state) => {
                if (!state.draft) return;
                // assume blocks is already a safe copy
                state.draft.blocks = blocks;
            }),

        // commit draft into real workouts and clear it
        commitDraft: () => {
            const { draft, order } = get();
            if (!draft) return null;

            const id = draft.id ?? uid();
            const workout: Workout = { ...draft, id };

            set((state) => {
                state.workouts[id] = workout;
                state.order = [id, ...order.filter((x) => x !== id)];
                state.draft = null;
            });

            return id;
        },

        clearDraft: () =>
            set((state) => {
                state.draft = null;
            }),
    }))
);

// ----- selectors --------------------------------------------------

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
