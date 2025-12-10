import { useEffect, useState } from 'react';

import type { Step } from '@core/timer';

type UseBlockPauseArgs = {
    step: Step | undefined;
    stepIndex: number;
    firstStepIndexByBlock: Map<number, number>;
    naturalFinished: boolean;
    forceFinished: boolean;
    pauseEngine: () => void;
};

export const useBlockPause = ({
    step,
    stepIndex,
    firstStepIndexByBlock,
    naturalFinished,
    forceFinished,
    pauseEngine,
}: UseBlockPauseArgs) => {
    const [awaitingBlockContinue, setAwaitingBlockContinue] = useState(false);
    const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(
        null
    );

    useEffect(() => {
        if (!step) {
            setCurrentBlockIndex(null);
            setAwaitingBlockContinue(false);
            return;
        }

        const blockIdx = step.blockIdx;
        setCurrentBlockIndex(blockIdx ?? null);

        if (
            blockIdx == null ||
            blockIdx === 0 || // no pause before first block
            forceFinished ||
            naturalFinished
        ) {
            setAwaitingBlockContinue(false);
            return;
        }

        const firstIndexForBlock = firstStepIndexByBlock.get(blockIdx);

        // If we just entered the *first* step of this block, pause and show "Prepare"
        if (firstIndexForBlock != null && stepIndex === firstIndexForBlock) {
            pauseEngine();
            setAwaitingBlockContinue(true);
        } else {
            // Inside the block -> normal running
            setAwaitingBlockContinue(false);
        }
    }, [
        step,
        stepIndex,
        firstStepIndexByBlock,
        forceFinished,
        naturalFinished,
        pauseEngine,
    ]);

    const clearBlockPause = () => {
        setAwaitingBlockContinue(false);
    };

    return {
        awaitingBlockContinue,
        currentBlockIndex,
        clearBlockPause,
    };
};
