import React, { useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import type { Phase } from '@core/timer';
import type { Workout } from '@core/entities';

import { AppText } from '@src/components/ui/Typography/AppText';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { PhasePill } from '../PhasePill/PhasePill';
import { PhaseArc } from '../PhaseArc/PhaseArc';
import { ExerciseInfoCard } from '../ExerciseInfoCard/ExerciseInfoCard';
import { NextExerciseCarousel } from '../NextExerciseCarousel/NextExerciseCarousel';
import useWorkoutRunStyles from '../../WorkoutRunScreen.styles';
import { useTheme } from '@src/theme/ThemeProvider';

const AnimatedAppText = Animated.createAnimatedComponent(AppText);

type WorkoutBlock = Workout['blocks'][number];

type RunPhaseSectionProps = {
    phase: Phase;
    phaseColor: string;
    phaseLabel: string;
    isFinished: boolean;

    // Block pause state
    awaitingBlockContinue: boolean;
    currentBlock: WorkoutBlock | undefined;
    currentBlockIndex: number | null;

    // Arc/timer
    remaining: number;
    phaseProgress: number;
    breathingPhase: SharedValue<number>;

    // Exercise info
    currentExerciseName: string | null;
    nextExerciseName: string | null;
};

export const RunPhaseSection = ({
    phase,
    phaseColor,
    phaseLabel,
    isFinished,
    awaitingBlockContinue,
    currentBlock,
    currentBlockIndex,
    remaining,
    phaseProgress,
    breathingPhase,
    currentExerciseName,
    nextExerciseName,
}: RunPhaseSectionProps) => {
    const st = useWorkoutRunStyles();
    const { theme } = useTheme();

    const isBlockPause = awaitingBlockContinue && !!currentBlock;

    const timerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 + breathingPhase.value * 0.08 }],
    }));

    const blockPauseInfo = useMemo(() => {
        if (!isBlockPause || !currentBlock) return null;

        const blockIdx =
            typeof currentBlockIndex === 'number' ? currentBlockIndex : 0;

        const title =
            currentBlock.title && currentBlock.title.trim().length > 0
                ? currentBlock.title.trim()
                : `Block ${blockIdx + 1}`;

        const exerciseNames = currentBlock.exercises.map(
            (exercise, exerciseIndex) => {
                const trimmedName = exercise.name?.trim();
                if (trimmedName && trimmedName.length > 0) {
                    return trimmedName;
                }
                return `Exercise ${exerciseIndex + 1}`;
            }
        );

        const exercisesLine = exerciseNames.join(' • ');
        const setsLabel = `${currentBlock.sets} set${
            currentBlock.sets === 1 ? '' : 's'
        }`;

        return {
            title,
            exercisesLine,
            setsLabel,
        };
    }, [isBlockPause, currentBlock, currentBlockIndex]);

    const pillLabel = isFinished
        ? 'Done'
        : isBlockPause
          ? 'Prepare'
          : phaseLabel;

    return (
        <>
            {/* ARC + PHASE / BLOCK PAUSE */}
            <View style={st.arcContainer}>
                <PhasePill color={phaseColor} label={pillLabel} />

                {isBlockPause && blockPauseInfo ? (
                    <View style={st.blockPauseContainer}>
                        <MetaCard
                            expandable={false}
                            topLeftContent={{
                                text: 'Next block',
                                icon: (
                                    <Ionicons
                                        name="barbell-outline"
                                        size={14}
                                        color={
                                            theme.palette.metaCard
                                                .topLeftContent.text
                                        }
                                    />
                                ),
                                backgroundColor:
                                    theme.palette.metaCard.topLeftContent
                                        .background,
                                color: theme.palette.metaCard.topLeftContent
                                    .text,
                                borderColor:
                                    theme.palette.metaCard.topLeftContent
                                        .border,
                            }}
                            summaryContent={
                                <View style={st.blockPauseSummary}>
                                    <AppText
                                        variant="body"
                                        style={st.blockPauseTitle}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {blockPauseInfo.title}
                                    </AppText>

                                    <View style={st.blockPauseRow}>
                                        <View style={st.blockPauseSetsPill}>
                                            <AppText
                                                variant="caption"
                                                style={st.blockPauseSetsText}
                                            >
                                                {blockPauseInfo.setsLabel}
                                            </AppText>
                                        </View>
                                    </View>

                                    <AppText
                                        variant="bodySmall"
                                        tone="muted"
                                        style={st.blockPauseExercises}
                                        numberOfLines={0}
                                    >
                                        {blockPauseInfo.exercisesLine}
                                    </AppText>
                                </View>
                            }
                        />

                        <AppText
                            variant="captionSmall"
                            tone="muted"
                            style={st.blockPauseHint}
                        >
                            Tap play to start this block.
                        </AppText>
                    </View>
                ) : (
                    <View style={st.arcWrapper}>
                        <PhaseArc
                            progress={phaseProgress}
                            color={phaseColor}
                            finished={isFinished}
                            breathingPhase={breathingPhase}
                        />
                        <AnimatedAppText
                            variant="title1"
                            style={[st.timer, timerAnimatedStyle]}
                        >
                            {isFinished ? 0 : remaining}
                        </AnimatedAppText>
                    </View>
                )}
            </View>

            {/* CURRENT + NEXT EXERCISE */}
            <View style={st.exerciseInfoContainer}>
                {!isFinished &&
                    !isBlockPause &&
                    currentExerciseName &&
                    currentExerciseName.length > 0 && (
                        <ExerciseInfoCard
                            phase={phase}
                            color={phaseColor}
                            currentExerciseName={currentExerciseName}
                        />
                    )}

                {!isFinished &&
                    !isBlockPause &&
                    nextExerciseName &&
                    nextExerciseName.length > 0 && (
                        <NextExerciseCarousel
                            phase={phase}
                            label={nextExerciseName}
                        />
                    )}
            </View>
        </>
    );
};
