import React from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import type { Phase, Step } from '@src/core/timer';
import type { WorkoutBlock } from '@src/core/entities/entities';

import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';

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
    currentBlockIndex: number | null;

    // Arc/timer
    remainingSec: number;
    breathingPhase: SharedValue<number>;

    // Exercise info
    currentExerciseName: string | null;
    nextExerciseName: string | null;

    // Finishing Zone
    openSharePreview: () => void;
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
    currentExerciseName,
    nextExerciseName,
    openSharePreview,
}: RunPhaseSectionProps) => {
    const st = useRunPhaseSectionStyles();
    const { theme } = useTheme();

    const isBlockPause = awaitingBlockContinue && !!currentBlock;

    const timerAnimatedStyle = useAnimatedStyle(() => {
        const t = isFinished ? 0 : breathingPhase.value;
        return { transform: [{ scale: 1 + t * 0.08 }] };
    }, [isFinished]);

    const pillLabel = isFinished ? 'Done' : phaseLabel;

    const safeBlockIndex = currentBlockIndex ?? 0;

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
                        index={safeBlockIndex}
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
                {!isFinished && currentExerciseName && (
                    <View style={st.exerciseInfoContainer}>
                        {currentExerciseName.length > 0 && (
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
                    </View>
                )}

                {/* FINISHING ZONE */}
                <AppearingView
                    visible={isFinished}
                    style={st.finishedContainer}
                >
                    <FinishedCard />

                    <View style={st.finishedFooterRow}>
                        <CircleIconButton
                            onPress={openSharePreview}
                            variant="secondary"
                        >
                            <Ionicons
                                name="share-outline"
                                size={22}
                                color={theme.palette.text.primary}
                            />
                        </CircleIconButton>
                    </View>
                </AppearingView>
            </AppearingView>
        </View>
    );
};
