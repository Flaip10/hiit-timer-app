import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { formatDuration } from '../../helpers';
import { useRunTopSectionStyles } from './RunTopSection.styles';
import { SetProgressPills } from './components/SetProgressPills/SetProgressPills';
import { DotIndicator } from './components/DotIndicator/DotIndicator';

type RunTopSectionProps = {
    workoutName: string;
    isFinished: boolean;
    remainingBlockSec: number;
    phaseColor: string;
    currentBlockIndex: number | null;
    totalBlocks: number;
    currentBlockTitle?: string | null;
    currentSetIndex: number;
    totalSets: number;
    setProgress: number;
    totalExercisesInBlock: number;
    currentExerciseIndexInBlock: number | null;
    isBlockPause: boolean;
};

export const RunTopSection = ({
    workoutName,
    isFinished,
    remainingBlockSec,
    phaseColor,
    currentBlockIndex,
    totalBlocks,
    currentBlockTitle,
    currentSetIndex,
    totalSets,
    setProgress,
    totalExercisesInBlock,
    currentExerciseIndexInBlock,
    isBlockPause,
}: RunTopSectionProps) => {
    const st = useRunTopSectionStyles();
    const { theme } = useTheme();

    const hasBlocks = totalBlocks > 0;
    const blockIdx = currentBlockIndex ?? 0;

    const resolvedBlockTitle = useMemo(() => {
        if (!hasBlocks) {
            return workoutName;
        }

        const trimmed = currentBlockTitle?.trim();
        if (trimmed && trimmed.length > 0) {
            return trimmed;
        }

        return `Block ${blockIdx + 1}`;
    }, [hasBlocks, workoutName, currentBlockTitle, blockIdx]);

    const showBlockDots = totalBlocks > 1;

    const safeTotalExercises =
        totalExercisesInBlock > 0 ? totalExercisesInBlock : 0;
    const safeExerciseIndex =
        currentExerciseIndexInBlock != null ? currentExerciseIndexInBlock : 0;

    const safeTotalSets = totalSets > 0 ? totalSets : 0;

    return (
        <View style={st.mainContainer}>
            {/* RUNNING HEADER ================================================== */}
            <AppearingView
                visible={!isFinished}
                style={st.pageHeader}
                offsetY={0}
                offsetX={-12}
            >
                {/* Running header */}
                <View style={st.upperRowContainer}>
                    <View style={st.blockHeaderRow}>
                        {/* Block title + icon */}
                        <View style={st.titleRow}>
                            <Ionicons
                                name="layers-outline"
                                size={16}
                                color={theme.palette.text.primary}
                                style={st.headerIcon}
                            />
                            <AppText
                                variant="title1"
                                style={st.runWorkoutTitle}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {resolvedBlockTitle}
                            </AppText>
                        </View>

                        <AppText
                            variant="bodySmall"
                            tone="muted"
                            style={st.workoutNameSecondary}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {workoutName}
                        </AppText>
                    </View>

                    {/* Block remaining time */}
                    <View style={st.workoutTimerContainer}>
                        <Ionicons
                            name="timer-outline"
                            size={16}
                            color={theme.palette.text.primary}
                            style={st.workoutTimerIcon}
                        />
                        <AppText variant="title3" style={st.workoutTimerText}>
                            {formatDuration(remainingBlockSec)}
                        </AppText>
                    </View>
                </View>

                {/* Set progress (animated pills), only when not in block pause */}
                {!isBlockPause && (
                    <>
                        <SetProgressPills
                            currentSetIndex={currentSetIndex}
                            totalSets={totalSets}
                            setProgress={setProgress}
                            phaseColor={phaseColor}
                        />

                        <View style={st.rowContainer}>
                            {/* Block progression */}
                            {showBlockDots ? (
                                <View style={st.rowContainer}>
                                    <AppText
                                        variant="bodySmall"
                                        tone="muted"
                                        style={st.blockHeaderLabel}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        Blocks
                                    </AppText>

                                    <DotIndicator
                                        total={totalBlocks}
                                        current={currentBlockIndex ?? 0}
                                        color={phaseColor}
                                    />
                                </View>
                            ) : null}

                            {/* Exercises progression in current block */}
                            {safeTotalExercises > 0 && (
                                <View style={st.rowContainer}>
                                    <AppText
                                        variant="bodySmall"
                                        tone="muted"
                                        style={st.blockHeaderLabel}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        Exercises
                                    </AppText>
                                    <DotIndicator
                                        total={safeTotalExercises}
                                        current={safeExerciseIndex}
                                        color={phaseColor}
                                    />
                                </View>
                            )}
                        </View>
                    </>
                )}
            </AppearingView>

            {/* FINISHED HEADER ================================================ */}
            <AppearingView
                visible={isFinished}
                style={st.pageHeader}
                offsetY={0}
                offsetX={-12}
                delay={260}
            >
                <View style={st.upperRowContainer}>
                    <View style={st.blockHeaderRow}>
                        <View style={st.titleRow}>
                            <Ionicons
                                name="barbell-outline"
                                size={16}
                                color={theme.palette.text.primary}
                                style={st.headerIcon}
                            />
                            <AppText
                                variant="title1"
                                style={st.runWorkoutTitle}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                Workout complete
                            </AppText>
                        </View>

                        <AppText
                            variant="bodySmall"
                            tone="muted"
                            style={st.workoutNameSecondary}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {workoutName}
                        </AppText>
                    </View>
                </View>

                <View style={st.finishedMetaRow}>
                    {hasBlocks && (
                        <View style={st.finishedMetaItem}>
                            <Ionicons
                                name="layers-outline"
                                size={14}
                                color={theme.palette.text.muted}
                                style={st.finishedMetaIcon}
                            />
                            <AppText
                                variant="captionSmall"
                                tone="muted"
                                style={st.finishedMetaText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {totalBlocks} block
                                {totalBlocks === 1 ? '' : 's'}
                            </AppText>
                        </View>
                    )}

                    {safeTotalSets > 0 && (
                        <View style={st.finishedMetaItem}>
                            <Feather
                                name="repeat"
                                size={14}
                                color={theme.palette.text.muted}
                                style={st.finishedMetaIcon}
                            />
                            <AppText
                                variant="captionSmall"
                                tone="muted"
                                style={st.finishedMetaText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {safeTotalSets} set
                                {safeTotalSets === 1 ? '' : 's'}
                            </AppText>
                        </View>
                    )}

                    {safeTotalExercises > 0 && (
                        <View style={st.finishedMetaItem}>
                            <Feather
                                name="activity"
                                size={14}
                                color={theme.palette.text.muted}
                                style={st.finishedMetaIcon}
                            />
                            <AppText
                                variant="captionSmall"
                                tone="muted"
                                style={st.finishedMetaText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {safeTotalExercises} exercise
                                {safeTotalExercises === 1 ? '' : 's'}
                            </AppText>
                        </View>
                    )}
                </View>
            </AppearingView>
        </View>
    );
};
