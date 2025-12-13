import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import useWorkoutMetaStripStyles from './SetProgressPills.styles';
import type { Step } from '@src/core/timer';
import { ProgressPill } from './ProgressPill/ProgressPill';

interface SetProgressPillsProps {
    totalSets: number;
    phaseColor: string;
    isRunning: boolean;
    currentStep: Step;
    setSteps: Step[];
}

export const SetProgressPills: React.FC<SetProgressPillsProps> = ({
    totalSets,
    phaseColor,
    isRunning,
    currentStep,
    setSteps,
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
                    setSteps={setSteps}
                />
            ))}
        </View>
    );
};

export default SetProgressPills;
