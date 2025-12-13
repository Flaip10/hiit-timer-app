import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Step } from '@core/timer';

type UseBlockPauseArgs = {
    step: Step | undefined;
    stepIndex: number;
    firstStepIndexByBlock: Map<number, number>;
    naturalFinished: boolean;
    forceFinished: boolean;

    pauseEngine: () => void;
    onPausedAtBlockStart?: (step: Step) => void;
};

export const useBlockPause = ({
    step,
    stepIndex,
    firstStepIndexByBlock,
    naturalFinished,
    forceFinished,
    pauseEngine,
    onPausedAtBlockStart,
}: UseBlockPauseArgs) => {
    const [awaitingBlockContinue, setAwaitingBlockContinue] = useState(false);

    const currentBlockIndex = useMemo(() => step?.blockIdx ?? null, [step]);

    useEffect(() => {
        if (!step) {
            setAwaitingBlockContinue(false);
            return;
        }

        const blockIdx = step.blockIdx;

        if (
            blockIdx == null ||
            blockIdx === 0 ||
            forceFinished ||
            naturalFinished
        ) {
            setAwaitingBlockContinue(false);
            return;
        }

        const firstIndexForBlock = firstStepIndexByBlock.get(blockIdx);

        // entered first step of a new block => pause
        if (firstIndexForBlock != null && stepIndex === firstIndexForBlock) {
            pauseEngine();
            onPausedAtBlockStart?.(step);
            setAwaitingBlockContinue(true);
            return;
        }

        setAwaitingBlockContinue(false);
    }, [
        step,
        stepIndex,
        firstStepIndexByBlock,
        forceFinished,
        naturalFinished,
        pauseEngine,
        onPausedAtBlockStart,
    ]);

    const clearBlockPause = useCallback(() => {
        setAwaitingBlockContinue(false);
    }, []);

    return {
        awaitingBlockContinue,
        currentBlockIndex,
        clearBlockPause,
    };
};
