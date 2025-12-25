import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import useWorkoutMetaStripStyles from './SetProgressPills.styles';

import { ProgressPill } from './ProgressPill/ProgressPill';

import type { RunMeta, Step } from '@src/core/timer';

interface SetProgressPillsProps {
    totalSets: number;
    phaseColor: string;
    isRunning: boolean;
    currentStep: Step;
    stepIndex: number;
    meta: RunMeta;
}

export const SetProgressPills: React.FC<SetProgressPillsProps> = ({
    totalSets,
    phaseColor,
    isRunning,
    currentStep,
    stepIndex,
    meta,
}) => {
    const st = useWorkoutMetaStripStyles();

    const currentSetIndex = currentStep.setIdx;

    const safeTotalSets = Math.max(totalSets || 1, 1);

    const pills = useMemo(
        () => Array.from({ length: safeTotalSets }, (_, i) => i),
        [safeTotalSets]
    );

    const [visualSetIdx, setVisualSetIdx] = useState(currentSetIndex);

    const isSetRest =
        currentStep.label === 'REST' && currentStep.id.startsWith('rest-set-');

    useEffect(() => {
        const next = isSetRest
            ? Math.min(currentSetIndex + 1, safeTotalSets - 1)
            : currentSetIndex;

        if (visualSetIdx !== next) setVisualSetIdx(next);
    }, [isSetRest, currentSetIndex, safeTotalSets, visualSetIdx]);

    return (
        <View style={st.metaStripPillsRow}>
            {pills.map((i) => (
                <ProgressPill
                    key={i}
                    index={i}
                    visualSetIdx={visualSetIdx}
                    phaseColor={phaseColor}
                    isRunning={isRunning}
                    currentStep={currentStep}
                    stepIndex={stepIndex}
                    meta={meta}
                />
            ))}
        </View>
    );
};

export default SetProgressPills;
