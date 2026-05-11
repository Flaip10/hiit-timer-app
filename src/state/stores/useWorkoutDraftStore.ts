import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { Workout, WorkoutBlock } from '@src/core/entities/entities';
import { uid } from '@src/core/id';
import i18next from '@src/i18n';

interface WorkoutDraftState {
    draft: Workout | null;
    sourceWorkoutVersionId: string | null;

    startDraftNew: () => void;
    startDraftQuick: () => void;
    startDraftFromWorkout: (workout: Workout) => void;
    startDraftFromImported: (
        workout: Workout,
        sourceWorkoutVersionId?: string
    ) => void;
    updateDraftMeta: (patch: Partial<Pick<Workout, 'name'>>) => void;
    updateDraftBlock: (blockId: string, patch: Partial<WorkoutBlock>) => void;
    setDraftBlocks: (blocks: WorkoutBlock[]) => void;
    buildWorkoutFromDraft: () => Workout | null;
    clearDraft: () => void;
}

const starterBlock = (): WorkoutBlock => ({
    id: uid(),
    title: 'Basic HIIT',
    sets: 3,
    restBetweenSetsSec: 20,
    restBetweenExercisesSec: 10,
    exercises: [
        {
            id: uid(),
            mode: 'time',
            value: 30,
        },
        {
            id: uid(),
            mode: 'time',
            value: 30,
        },
        {
            id: uid(),
            mode: 'time',
            value: 30,
        },
    ],
});

const starterWorkout = (): Workout => ({
    id: uid(),
    name: 'New Workout',
    blocks: [starterBlock()],
    updatedAtMs: Date.now(),
});

const quickWorkout = (): Workout => ({
    id: uid(),
    name: i18next.t('workouts.defaults.quickWorkoutName'),
    blocks: [
        {
            ...starterBlock(),
            title: i18next.t('workouts.defaults.quickBlockTitle'),
        },
    ],
    updatedAtMs: Date.now(),
});

export const useWorkoutDraftStore = create<WorkoutDraftState>()(
    immer((set, get) => ({
        draft: null,
        sourceWorkoutVersionId: null,

        startDraftNew: () =>
            set(() => ({
                draft: starterWorkout(),
                sourceWorkoutVersionId: null,
            })),

        startDraftQuick: () =>
            set(() => ({
                draft: quickWorkout(),
                sourceWorkoutVersionId: null,
            })),

        startDraftFromWorkout: (workout) => {
            const clone: Workout =
                typeof structuredClone === 'function'
                    ? structuredClone(workout)
                    : (JSON.parse(JSON.stringify(workout)) as Workout);

            set(() => ({
                draft: clone,
                sourceWorkoutVersionId: null,
            }));
        },

        startDraftFromImported: (imported, sourceWorkoutVersionId) =>
            set(() => {
                const clone: Workout =
                    typeof structuredClone === 'function'
                        ? structuredClone(imported)
                        : (JSON.parse(JSON.stringify(imported)) as Workout);

                clone.id = uid();

                return {
                    draft: clone,
                    sourceWorkoutVersionId: sourceWorkoutVersionId ?? null,
                };
            }),

        updateDraftMeta: (patch) =>
            set((state) => {
                if (!state.draft) return;
                state.draft = { ...state.draft, ...patch };
            }),

        updateDraftBlock: (blockId, patch) =>
            set((state) => {
                if (!state.draft) return;

                state.draft.blocks = state.draft.blocks.map((block) =>
                    block.id === blockId ? { ...block, ...patch } : block
                );
            }),

        setDraftBlocks: (blocks) =>
            set((state) => {
                if (!state.draft) return;
                state.draft.blocks = blocks;
            }),

        buildWorkoutFromDraft: () => {
            const { draft } = get();
            if (!draft) return null;

            const id = draft.id.length > 0 ? draft.id : uid();

            return {
                ...draft,
                id,
                updatedAtMs: Date.now(),
            };
        },

        clearDraft: () =>
            set((state) => {
                state.draft = null;
                state.sourceWorkoutVersionId = null;
            }),
    }))
);
