import { useEffect, useRef, useState } from 'react';

import type { Step } from '@core/timer';
import type { Workout } from '@core/entities';

type UseCompletionTrackingArgs = {
    steps: Step[];
    stepIndex: number;
    workout?: Workout;
    lastSetStepIndexMap: Map<string, number>;
    setDurationSecMap: Map<string, number>;
    naturalFinished: boolean;
};

export const useCompletionTracking = ({
    steps,
    stepIndex,
    workout,
    lastSetStepIndexMap,
    setDurationSecMap,
    naturalFinished,
}: UseCompletionTrackingArgs) => {
    const [completedSetsByBlock, setCompletedSetsByBlock] = useState<number[]>(
        []
    );
    const [elapsedCompletedSec, setElapsedCompletedSec] = useState(0);

    const completedSetKeysRef = useRef<Set<string>>(new Set());
    const lastStepIndexRef = useRef<number | null>(null);
    const finalStepProcessedRef = useRef(false);

    // Reset when workout / steps change
    useEffect(() => {
        const blocksLength = workout?.blocks?.length ?? 0;
        setCompletedSetsByBlock(Array(blocksLength).fill(0));
        setElapsedCompletedSec(0);
        completedSetKeysRef.current = new Set();
        lastStepIndexRef.current = null;
        finalStepProcessedRef.current = false;
    }, [steps, workout]);

    const processCompletedStepIndex = (completedIndex: number) => {
        const completedStep = steps[completedIndex];
        if (!completedStep) return;

        const { blockIdx, setIdx } = completedStep;
        if (blockIdx == null || setIdx == null) return;

        const key = `${blockIdx}-${setIdx}`;
        const lastIdxForSet = lastSetStepIndexMap.get(key);

        // Only mark when we just finished the *last* step of that set
        if (lastIdxForSet == null || lastIdxForSet !== completedIndex) return;
        if (completedSetKeysRef.current.has(key)) return;

        completedSetKeysRef.current.add(key);

        // Increment completed sets for that block
        setCompletedSetsByBlock((prev) => {
            if (blockIdx < 0) return prev;
            const next = prev.slice();
            if (blockIdx >= next.length) return next;
            next[blockIdx] = (next[blockIdx] ?? 0) + 1;
            return next;
        });

        // Add the full planned duration of that set
        const setDurationSec = setDurationSecMap.get(key) ?? 0;
        if (setDurationSec > 0) {
            setElapsedCompletedSec((prev) => prev + setDurationSec);
        }
    };

    // When stepIndex changes, the previous step has just finished
    useEffect(() => {
        if (steps.length === 0) return;

        const prevIndex = lastStepIndexRef.current;

        if (prevIndex == null) {
            lastStepIndexRef.current = stepIndex;
            return;
        }

        if (stepIndex !== prevIndex) {
            processCompletedStepIndex(prevIndex);
            lastStepIndexRef.current = stepIndex;
        }
    }, [stepIndex, steps, lastSetStepIndexMap, setDurationSecMap]);

    // When workout naturally finishes, ensure the last step is processed once
    useEffect(() => {
        if (!naturalFinished) return;
        if (finalStepProcessedRef.current) return;

        finalStepProcessedRef.current = true;
        if (stepIndex >= 0 && stepIndex < steps.length) {
            processCompletedStepIndex(stepIndex);
        }
    }, [
        naturalFinished,
        stepIndex,
        steps,
        lastSetStepIndexMap,
        setDurationSecMap,
    ]);

    const plannedSetsByBlock = workout?.blocks?.map((b) => b.sets ?? 0) ?? [];

    const totalPlannedSets = plannedSetsByBlock.reduce(
        (accumulator, value) => accumulator + (value ?? 0),
        0
    );

    const totalCompletedSets = completedSetsByBlock.reduce(
        (accumulator, value) => accumulator + (value ?? 0),
        0
    );

    return {
        completedSetsByBlock,
        elapsedCompletedSec,
        totalPlannedSets,
        totalCompletedSets,
    };
};
