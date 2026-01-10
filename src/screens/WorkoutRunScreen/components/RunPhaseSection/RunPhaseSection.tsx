import React from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    type SharedValue,
} from 'react-native-reanimated';

import type { Phase, Step } from '@src/core/timer';
import type { WorkoutBlock } from '@src/core/entities/entities';
import type { WorkoutSessionStats } from '@src/core/entities/workoutSession.interfaces';

import { AppText } from '@src/components/ui/Typography/AppText';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';

import FinishedCard from './components/FinishedCard/FinishedCard';
import { PhasePill } from './components/PhasePill/PhasePill';
import { PhaseArc } from './components/PhaseArc/PhaseArc';
import { ExerciseInfoCard } from './components/ExerciseInfoCard/ExerciseInfoCard';
import { NextExerciseCarousel } from './components/NextExerciseCarousel/NextExerciseCarousel';
import { WorkoutBlockItem } from '@src/screens/EditWorkoutScreen/components/WorkoutBlockItem/WorkoutBlockItem';
import { useRunPhaseSectionStyles } from './RunPhaseSection.styles';

const AnimatedAppText = Animated.createAnimatedComponent(AppText);

type RunPhaseSectionProps = {
    phase: Phase;
    phaseColor: string;
    phaseLabel: string;
    isFinished: boolean;
    currentStep: Step;
    isRunning: boolean;

    // Block pause state
    awaitingBlockContinue: boolean;
    currentBlock: WorkoutBlock | null;
    currentBlockIndex: number;

    // Arc/timer
    remainingSec: number;
    breathingPhase: SharedValue<number>;

    // Finishing Zone
    openSharePreview: () => void;
    runStats?: WorkoutSessionStats;
    totalDurationSec?: number;
};

export const RunPhaseSection = ({
    phase,
    phaseColor,
    phaseLabel,
    isFinished,
    awaitingBlockContinue,
    currentBlock,
    currentBlockIndex,
    remainingSec,
    currentStep,
    isRunning,
    breathingPhase,
    runStats,
    totalDurationSec,
}: RunPhaseSectionProps) => {
    const st = useRunPhaseSectionStyles();

    const isBlockPause = awaitingBlockContinue && !!currentBlock;

    const currentExerciseName = currentStep.name;
    const nextExerciseName = currentStep.nextName;

    const timerAnimatedStyle = useAnimatedStyle(() => {
        const t = isFinished ? 0 : breathingPhase.value;
        return { transform: [{ scale: 1 + t * 0.08 }] };
    }, [isFinished]);

    const pillLabel = isFinished ? 'Done' : phaseLabel;

    return (
        <View style={st.mainContainer}>
            {/* BLOCK PAUSE – reuse WorkoutSummary layout */}
            <AppearingView
                visible={isBlockPause}
                style={st.blockPauseContainer}
                delay={260}
            >
                <AppText
                    variant="bodySmall"
                    tone="muted"
                    style={st.blockPauseHint}
                >
                    Next Block:
                </AppText>
                {currentBlock && (
                    <WorkoutBlockItem
                        index={currentBlockIndex}
                        block={currentBlock}
                        expanded
                    />
                )}
            </AppearingView>

            {/* ARC / EXERCISES / FINISHED CARD  */}
            <AppearingView
                visible={!isBlockPause}
                style={st.arcContainer}
                delay={260}
            >
                <PhasePill color={phaseColor} label={pillLabel} />

                <View style={st.arcWrapper}>
                    <PhaseArc
                        currentStep={currentStep}
                        isRunning={isRunning}
                        color={phaseColor}
                        finished={isFinished}
                        breathingPhase={breathingPhase}
                    />
                    <AnimatedAppText
                        variant="title1"
                        style={[st.timer, timerAnimatedStyle]}
                    >
                        {isFinished ? 0 : Math.max(0, remainingSec)}
                    </AnimatedAppText>
                </View>

                {/* EXERCISES */}
                {/* {!isFinished && currentExerciseName && ( */}
                <AppearingView
                    visible={!isFinished && currentExerciseName != null}
                    style={st.exerciseInfoContainer}
                    delay={260}
                >
                    {/* <View style={st.exerciseInfoContainer}> */}
                    {currentExerciseName && currentExerciseName.length > 0 && (
                        <ExerciseInfoCard
                            phase={phase}
                            color={phaseColor}
                            currentExerciseName={currentExerciseName}
                        />
                    )}

                    {nextExerciseName && nextExerciseName.length > 0 && (
                        <NextExerciseCarousel
                            phase={phase}
                            label={nextExerciseName}
                        />
                    )}
                </AppearingView>
                {/* )} */}

                {/* FINISHING ZONE */}
                <AppearingView
                    visible={isFinished}
                    style={st.finishedContainer}
                    delay={260}
                >
                    <FinishedCard
                        runStats={runStats}
                        totalDurationSec={totalDurationSec}
                    />
                </AppearingView>
            </AppearingView>
        </View>
    );
};
