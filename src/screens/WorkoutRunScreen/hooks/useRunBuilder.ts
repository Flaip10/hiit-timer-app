import { useMemo } from 'react';

import type { Workout } from '@src/core/entities/entities';
import type { Step } from '@core/timer';
import { buildSteps } from '@core/timer';

export interface RunPlan {
    steps: Step[];

    // structure
    totalBlocks: number;
    plannedSetsByBlock: number[]; // [blockIdx] => sets
    totalSetsForRun: number; // sum(plannedSetsByBlock)

    // UI lookup
    exerciseNamesByBlock: string[][]; // [blockIdx][exIdx] => label
    exercisesCountByBlock: number[]; // [blockIdx] => len

    // useful for derived UI
    blockTitles?: (string | null)[];
    runKey: string; // reset key
}

const clampInt = (v: unknown, fallback: number) => {
    const n = typeof v === 'number' ? v : fallback;
    if (!Number.isFinite(n)) return fallback;
    return Math.trunc(n);
};

const normalizeName = (name: unknown, fallback: string) => {
    const s = typeof name === 'string' ? name.trim() : '';
    return s.length > 0 ? s : fallback;
};

type UseRunBuilderArgs = {
    workout?: Workout | null;
    prepSec?: number;
};

export const useRunBuilder = ({
    workout,
    prepSec = 5,
}: UseRunBuilderArgs): RunPlan => {
    return useMemo(() => {
        const blocks = workout?.blocks ?? [];
        const totalBlocks = blocks.length;

        if (!workout || totalBlocks === 0) {
            return {
                steps: [],
                totalBlocks: 0,
                plannedSetsByBlock: [],
                totalSetsForRun: 0,
                exerciseNamesByBlock: [],
                exercisesCountByBlock: [],
                blockTitles: [],
                runKey: 'empty',
            };
        }

        const built = buildSteps(prepSec, blocks);
        const steps = built.steps;

        const plannedSetsByBlock = blocks.map((b) =>
            Math.max(0, clampInt(b.sets, 0))
        );
        const totalSetsForRun = plannedSetsByBlock.reduce((a, b) => a + b, 0);

        const blockTitles = blocks.map((b) =>
            b && typeof b.title === 'string' ? b.title.trim() || null : null
        );

        const exerciseNamesByBlock = blocks.map((b) => {
            const exs = b?.exercises ?? [];
            return exs.map((ex, exIdx) =>
                normalizeName(ex?.name, `Exercise ${exIdx + 1}`)
            );
        });

        const exercisesCountByBlock = exerciseNamesByBlock.map(
            (arr) => arr.length
        );

        // A stable key that changes whenever the plan changes in any meaningful way.
        const runKey = JSON.stringify({
            workoutId: workout.id,
            prepSec,
            blocks: blocks.map((b, bi) => ({
                i: bi,
                id: b.id,
                sets: plannedSetsByBlock[bi],
                restSets: clampInt(b.restBetweenSetsSec, 0),
                restExercises: clampInt(b.restBetweenExercisesSec, 0),
                exercises: b.exercises.map((ex, exIdx) => ({
                    i: exIdx,
                    id: ex.id,
                    mode: ex.mode,
                    value: clampInt(ex.value, 0),
                })),
            })),
        });

        return {
            steps,
            totalBlocks,
            plannedSetsByBlock,
            totalSetsForRun,
            exerciseNamesByBlock,
            exercisesCountByBlock,
            blockTitles,
            runKey,
        };
    }, [workout, prepSec]);
};

export default useRunBuilder;
