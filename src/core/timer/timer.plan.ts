import type { Workout, WorkoutBlock } from '../entities/entities';
import {
    clampInt,
    exDisplayName,
    normalizeName,
    normalizeTitle,
    setKey,
} from './timer.utils';

import type { RunMeta, RunPlan, Step } from './timer.types';

/**
 * Creates a stable hash for a string.
 * Used to keep meta.runKey small and stable without storing the full JSON payload.
 *
 * FNV-1a 32-bit hash, encoded as unsigned base36.
 */
const hashStringFnv1a = (input: string): string => {
    const FNV_OFFSET_BASIS = 0x811c9dc5;
    const FNV_PRIME = 0x01000193;

    let hash = FNV_OFFSET_BASIS;

    for (const char of input) {
        // eslint-disable-next-line no-bitwise
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, FNV_PRIME);
    }

    // eslint-disable-next-line no-bitwise
    return (hash >>> 0).toString(36);
};

/**
 * Prepares run data from a workout:
 * - steps: sequential Step[]
 * - meta: precomputed maps/counters to keep reducers/hooks simple and efficient
 */
export const prepareRunData = (
    workout: Workout | null | undefined,
    prepSec: number
): RunPlan => {
    const blocks: WorkoutBlock[] = workout?.blocks ?? [];
    const totalBlocks = blocks.length;

    const steps: Step[] = [];

    // Per Block data
    const blockTitles: (string | null)[] = Array(totalBlocks).fill(null);
    const exerciseNamesByBlock: string[][] = Array(totalBlocks)
        .fill(null)
        .map(() => []);
    const exercisesCountByBlock: number[] = Array(totalBlocks).fill(0);
    const plannedSetsByBlock: number[] = Array(totalBlocks).fill(0);
    const lastWorkStepIndexByBlock = new Map<number, number>();
    const firstStepIndexByBlock = new Map<number, number>();
    const blockTotalSecByBlock: number[] = Array(totalBlocks).fill(0);

    // Per set data
    const lastWorkStepIndexBySet = new Map<string, number>();
    const workStepsCountBySet = new Map<string, number>();

    // Set-progress precompute:
    // - per set (keyed): total counted ms
    // - per stepIndex: elapsed counted ms before this step, and this step duration counted ms
    const setTotalMsByKey = new Map<string, number>();
    const setElapsedBeforeMsByStepIndex: number[] = [];
    const setStepMsByStepIndex: number[] = [];

    // Accumulated elapsed time (ms) per set, keyed by block+set composite key
    const setElapsedMsByKey = new Map<string, number>();

    const isCountedSetStep = (s: Step) => {
        if (s.setIdx < 0) return false; // excludes PREP
        if (s.label === 'WORK') return true;
        // Only count rest between exercises (rest-set should not reset/flicker set progress)
        if (s.label === 'REST' && !s.id.startsWith('rest-set-')) return true;
        return false;
    };

    const pushStep = (s: Step) => {
        // Backfill `nextName` so REST steps (and the previous WORK) can show the upcoming WORK name.
        // Walk backwards within the same block until the previous WORK is reached.
        if (s.label === 'WORK' && s.name) {
            for (let j = steps.length - 1; j >= 0; j -= 1) {
                const prev = steps[j];

                // Stop at block boundary
                if (prev.blockIdx !== s.blockIdx) break;

                // Don't override explicit nextName (PREP/rest-set may set it)
                if (prev.nextName != null) continue;

                prev.nextName = s.name;

                // Once we've updated the previous WORK step too, stop.
                if (prev.label === 'WORK') break;
            }
        }

        // First step index per block (including PREP if present)
        if (!firstStepIndexByBlock.has(s.blockIdx)) {
            firstStepIndexByBlock.set(s.blockIdx, steps.length);
        }

        // Total block seconds
        if (s.blockIdx >= 0 && s.blockIdx < totalBlocks) {
            blockTotalSecByBlock[s.blockIdx] += s.durationSec;
        }

        // Set progress precompute for set progress pills component
        const stepIndex = steps.length;

        if (s.setIdx >= 0) {
            const setCompositeKey = setKey(s.blockIdx, s.setIdx);
            const elapsedCountedMsBeforeStep =
                setElapsedMsByKey.get(setCompositeKey) ?? 0;

            setElapsedBeforeMsByStepIndex[stepIndex] =
                elapsedCountedMsBeforeStep;

            if (isCountedSetStep(s)) {
                const stepCountedDurationMs = Math.max(0, s.durationSec * 1000);

                setStepMsByStepIndex[stepIndex] = stepCountedDurationMs;

                setElapsedMsByKey.set(
                    setCompositeKey,
                    elapsedCountedMsBeforeStep + stepCountedDurationMs
                );

                setTotalMsByKey.set(
                    setCompositeKey,
                    (setTotalMsByKey.get(setCompositeKey) ?? 0) +
                        stepCountedDurationMs
                );
            } else {
                setStepMsByStepIndex[stepIndex] = 0;
            }
        } else {
            // PREP / non-set steps
            setElapsedBeforeMsByStepIndex[stepIndex] = 0;
            setStepMsByStepIndex[stepIndex] = 0;
        }

        steps.push(s);
    };

    let totalExercisesForRun = 0;
    let totalSetsForRun = 0;

    // ---------- meta from workout structure ----------
    for (let bi = 0; bi < totalBlocks; bi += 1) {
        const block = blocks[bi];
        const exs = block.exercises;

        blockTitles[bi] = normalizeTitle(block.title);
        exerciseNamesByBlock[bi] = exs.map((ex, exIdx) =>
            normalizeName(ex.name, `Exercise ${exIdx + 1}`)
        );

        const timedExercises = exs
            .map((ex, exIdx) => ({ ex, exIdx }))
            .filter(
                ({ ex }) => ex.mode === 'time' && clampInt(ex.value, 0) > 0
            );
        const exercisesCount = timedExercises.length;
        const setsCount = Math.max(0, clampInt(block.sets, 0));

        exercisesCountByBlock[bi] = exercisesCount;
        plannedSetsByBlock[bi] = setsCount;

        totalExercisesForRun += exercisesCount;
        totalSetsForRun += setsCount;

        if (exercisesCount === 0 || setsCount === 0) continue;

        // ---------- build steps + maps ----------
        let isBlockPrepAdded = false;

        for (let si = 0; si < setsCount; si += 1) {
            const setCompositeKey = setKey(bi, si);

            // Initialize set counters (explicitly; avoids undefined checks later)
            if (!workStepsCountBySet.has(setCompositeKey)) {
                workStepsCountBySet.set(setCompositeKey, 0);
            }

            for (let wi = 0; wi < exercisesCount; wi += 1) {
                const { ex, exIdx } = timedExercises[wi];
                const workSec = Math.max(0, clampInt(ex.value, 0));

                // Block-level PREP once, before first WORK of block
                if (!isBlockPrepAdded) {
                    isBlockPrepAdded = true;

                    if (prepSec > 0) {
                        const first = timedExercises[0];
                        const second = timedExercises[1] ?? first;

                        const firstName = exDisplayName(
                            bi,
                            first.exIdx,
                            first.ex.name
                        );
                        const secondName = exDisplayName(
                            bi,
                            second.exIdx,
                            second.ex.name
                        );

                        pushStep({
                            id: `prep-${bi}`,
                            label: 'PREP',
                            durationSec: Math.max(0, clampInt(prepSec, 0)),
                            blockIdx: bi,
                            exIdx: -1,
                            setIdx: -1,
                            name: firstName,
                            nextName: secondName,
                        });
                    }
                }

                // Push WORK step
                pushStep({
                    id: `work-${bi}-${si}-${exIdx}`,
                    label: 'WORK',
                    durationSec: workSec,
                    blockIdx: bi,
                    exIdx,
                    setIdx: si,
                    name: exDisplayName(bi, exIdx, ex.name),
                });

                // Update WORK meta values
                const workStepIndex = steps.length - 1;
                lastWorkStepIndexBySet.set(setCompositeKey, workStepIndex);
                lastWorkStepIndexByBlock.set(bi, workStepIndex);
                workStepsCountBySet.set(
                    setCompositeKey,
                    (workStepsCountBySet.get(setCompositeKey) ?? 0) + 1
                );

                // Push REST between exercises step (same set)
                const isLastExerciseInSet = wi === exercisesCount - 1;
                const restBetweenExercisesSec = Math.max(
                    0,
                    clampInt(block.restBetweenExercisesSec, 0)
                );

                if (!isLastExerciseInSet && restBetweenExercisesSec > 0) {
                    pushStep({
                        id: `rest-ex-${bi}-${si}-${exIdx}`,
                        label: 'REST',
                        durationSec: restBetweenExercisesSec,
                        blockIdx: bi,
                        exIdx,
                        setIdx: si,
                        name: exDisplayName(bi, exIdx, ex.name),
                    });
                }
            }

            // Push REST between sets step (after last exercise of the set)
            const isLastSet = si === setsCount - 1;
            const restBetweenSetsSec = Math.max(
                0,
                clampInt(block.restBetweenSetsSec, 0)
            );

            if (!isLastSet && restBetweenSetsSec > 0) {
                const last = timedExercises[timedExercises.length - 1];
                const nextFirst = timedExercises[0];

                const firstName = exDisplayName(bi, last.exIdx, last.ex.name);
                const secondName = exDisplayName(
                    bi,
                    nextFirst.exIdx,
                    nextFirst.ex.name
                );

                pushStep({
                    id: `rest-set-${bi}-${si}`,
                    label: 'REST',
                    durationSec: restBetweenSetsSec,
                    blockIdx: bi,
                    exIdx: last.exIdx,
                    setIdx: si, // keep if your UI uses this as “rest after set si”
                    name: firstName,
                    nextName: secondName,
                });
            }
        }
    }

    /**
     * For each step index, compute remaining seconds *after* this step within the current block.
     * (Excludes current step duration.)
     */
    const remainingBlockAfterStepIndexSec: number[] = Array(steps.length).fill(
        0
    );

    let blockEndIndex = steps.length - 1;

    while (blockEndIndex >= 0) {
        const blockIdx = steps[blockEndIndex].blockIdx;

        // Find start of this contiguous block segment
        let blockStartIndex = blockEndIndex;
        while (
            blockStartIndex >= 0 &&
            steps[blockStartIndex].blockIdx === blockIdx
        ) {
            blockStartIndex -= 1;
        }

        // Block segment is (blockStartIndex .. blockEndIndex]
        let remainingSecAfterStep = 0;

        for (
            let stepIndex = blockEndIndex;
            stepIndex > blockStartIndex;
            stepIndex -= 1
        ) {
            remainingBlockAfterStepIndexSec[stepIndex] = remainingSecAfterStep;

            remainingSecAfterStep += steps[stepIndex].durationSec;
        }

        blockEndIndex = blockStartIndex;
    }

    // Stable identity key:
    // Include enough to reset correctly when anything meaningful changes, then hash it.
    const runKeyPayload = JSON.stringify({
        workoutId: workout?.id ?? 'no-workout',
        prepSec: clampInt(prepSec, 0),
        blocks: blocks.map((b, bi) => ({
            i: bi,
            id: b.id,
            title: normalizeTitle(b.title),
            sets: plannedSetsByBlock[bi],
            restSets: clampInt(b.restBetweenSetsSec, 0),
            restExercises: clampInt(b.restBetweenExercisesSec, 0),
            exercises: b.exercises.map((ex, exIdx) => ({
                i: exIdx,
                id: ex.id,
                mode: ex.mode,
                value: clampInt(ex.value, 0),
                name: normalizeName(ex.name, ''),
            })),
        })),
    });

    const runKey = hashStringFnv1a(runKeyPayload);

    const meta: RunMeta = {
        blockTitles,
        exerciseNamesByBlock,

        exercisesCountByBlock,
        plannedSetsByBlock,

        totalBlocks,
        totalSetsForRun,
        totalExercisesForRun,

        lastWorkStepIndexBySet,
        workStepsCountBySet,

        lastWorkStepIndexByBlock,
        firstStepIndexByBlock,

        blockTotalSecByBlock,
        remainingBlockAfterStepIndexSec,

        setTotalMsByKey,
        setElapsedBeforeMsByStepIndex,
        setStepMsByStepIndex,

        runKey,
    };

    return { steps, meta };
};
