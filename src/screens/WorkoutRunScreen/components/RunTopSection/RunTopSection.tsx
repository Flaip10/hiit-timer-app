import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import type { Step } from '@src/core/timer';

import { formatDuration } from '../../helpers';
import { useRunTopSectionStyles } from './RunTopSection.styles';
import { SetProgressPills } from './components/SetProgressPills/SetProgressPills';
import { DotIndicator } from './components/DotIndicator/DotIndicator';

type RunTopSectionProps = {
    workoutName: string;

    // current context
    currentBlockIndex: number | null;
    currentBlockTitle?: string | null;
    totalBlocks: number;

    totalSetsInBlock: number; // planned sets for the current block
    totalExercisesInBlock: number; // planned exercises for the current block
    currentExerciseIndexInBlock: number | null;

    remainingBlockSec: number;
    isFinished: boolean;
    isBlockPause: boolean;
    isRunning: boolean;

    phaseColor: string;
    currentStep: Step;
    setSteps: Step[];
};

export const RunTopSection = ({
    workoutName,
    currentBlockIndex,
    currentBlockTitle,
    totalBlocks,
    totalSetsInBlock,
    totalExercisesInBlock,
    currentExerciseIndexInBlock,
    remainingBlockSec,
    isFinished,
    isBlockPause,
    isRunning,
    phaseColor,
    currentStep,
    setSteps,
}: RunTopSectionProps) => {
    const st = useRunTopSectionStyles();
    const { theme } = useTheme();

    const hasBlocks = totalBlocks > 0;
    const blockIdx = currentBlockIndex ?? 0;
    const showBlockDots = totalBlocks > 1;

    const resolvedBlockTitle = useMemo(() => {
        if (!hasBlocks) return workoutName;

        const trimmed = currentBlockTitle?.trim();
        if (trimmed) return trimmed;

        return `Block ${blockIdx + 1}`;
    }, [hasBlocks, workoutName, currentBlockTitle, blockIdx]);

    const safeTotalExercises = Math.max(0, totalExercisesInBlock);
    const safeExerciseIndex = Math.max(0, currentExerciseIndexInBlock ?? 0);
    const safeTotalSets = Math.max(0, totalSetsInBlock);

    return (
        <View style={st.mainContainer}>
            {/* RUNNING HEADER ================================================== */}
            <AppearingView
                visible={!isFinished}
                style={st.pageHeader}
                offsetY={0}
                offsetX={-12}
            >
                <View style={st.upperRowContainer}>
                    <View style={st.blockHeaderRow}>
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
                <AppearingView
                    visible={!isBlockPause}
                    style={st.bottomRowContainer}
                    delay={260}
                    offsetY={-12}
                >
                    <SetProgressPills
                        totalSets={totalSetsInBlock}
                        phaseColor={phaseColor}
                        currentStep={currentStep}
                        setSteps={setSteps}
                        isRunning={isRunning}
                    />

                    <View style={st.rowContainer}>
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
                                    current={blockIdx}
                                    color={phaseColor}
                                />
                            </View>
                        ) : null}

                        {safeTotalExercises > 0 ? (
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
                        ) : null}
                    </View>
                </AppearingView>
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
                    {hasBlocks ? (
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
                    ) : null}

                    {safeTotalSets > 0 ? (
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
                    ) : null}

                    {safeTotalExercises > 0 ? (
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
                    ) : null}
                </View>
            </AppearingView>
        </View>
    );
};
