import React, { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import type { RunMeta, Step } from '@src/core/timer';

import { formatDuration } from '../../helpers';
import { useRunTopSectionStyles } from './RunTopSection.styles';
import { SetProgressPills } from './components/SetProgressPills/SetProgressPills';
import { DotIndicator } from './components/DotIndicator/DotIndicator';
import { useTranslation } from 'react-i18next';

type RunTopSectionProps = {
    workoutName: string;

    isFinished: boolean;
    isBlockPause: boolean;

    isRunning: boolean;
    remainingBlockSec: number;
    phaseColor: string;

    currentBlockIdx: number;
    currentExerciseIndexInBlock: number;

    currentStep: Step;
    stepIndex: number;
    meta: RunMeta;
};

export const RunTopSection = ({
    workoutName,

    isFinished,
    isBlockPause,

    isRunning,
    remainingBlockSec,
    phaseColor,

    currentBlockIdx,
    currentExerciseIndexInBlock,

    currentStep,
    stepIndex,
    meta,
}: RunTopSectionProps) => {
    const { t } = useTranslation();
    const st = useRunTopSectionStyles();
    const { theme } = useTheme();

    const totalBlocks = meta.totalBlocks;
    const blockIdx = Math.min(
        Math.max(0, currentBlockIdx),
        Math.max(0, totalBlocks - 1)
    );
    const currentBlockTitle = meta.blockTitles[blockIdx];
    const resolvedBlockTitle =
        (currentBlockTitle ?? '').trim() ||
        t('common.labels.blockWithIndex', { index: blockIdx + 1 });

    const totalExercisesInBlock = meta.exercisesCountByBlock[blockIdx];
    const totalSetsInBlock = meta.plannedSetsByBlock[blockIdx];

    const totalExercisesInWorkout = meta.totalExercisesForRun;
    const totalSetsInWorkout = meta.totalSetsForRun;

    const exerciseIdx = Math.min(
        Math.max(0, currentExerciseIndexInBlock),
        Math.max(0, totalExercisesInBlock - 1)
    );

    const [runningHeaderH, setRunningHeaderH] = useState(0);

    const handleRunningLayout = useCallback((e: LayoutChangeEvent) => {
        const h = Math.ceil(e.nativeEvent.layout.height);
        setRunningHeaderH((prev) => (h > prev ? h : prev));
    }, []);

    return (
        <View style={st.mainContainer}>
            {/* RUNNING HEADER ================================================== */}
            <AppearingView
                visible={!isFinished}
                style={st.pageHeader}
                offsetY={0}
                offsetX={-12}
                onLayout={handleRunningLayout}
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
                        stepIndex={stepIndex}
                        meta={meta}
                        isRunning={isRunning}
                    />

                    <View style={st.rowContainer}>
                        {totalBlocks > 1 ? (
                            <View style={st.rowContainer}>
                                <AppText
                                    variant="bodySmall"
                                    tone="muted"
                                    style={st.blockHeaderLabel}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {t('run.top.blocks')}
                                </AppText>

                                <DotIndicator
                                    total={totalBlocks}
                                    current={blockIdx}
                                    color={phaseColor}
                                />
                            </View>
                        ) : null}

                        {totalExercisesInBlock > 0 ? (
                            <View style={st.rowContainer}>
                                <AppText
                                    variant="bodySmall"
                                    tone="muted"
                                    style={st.blockHeaderLabel}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {t('run.top.exercises')}
                                </AppText>
                                <DotIndicator
                                    total={totalExercisesInBlock}
                                    current={exerciseIdx}
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
                style={[st.pageHeader, { minHeight: runningHeaderH }]}
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
                                {t('run.top.completeTitle')}
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
                    {totalBlocks > 0 ? (
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
                                {t('common.units.block', {
                                    count: totalBlocks,
                                })}
                            </AppText>
                        </View>
                    ) : null}

                    {totalSetsInWorkout > 0 ? (
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
                                {t('common.units.set', {
                                    count: totalSetsInWorkout,
                                })}
                            </AppText>
                        </View>
                    ) : null}

                    {totalExercisesInWorkout > 0 ? (
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
                                {t('common.units.exercise', {
                                    count: totalExercisesInWorkout,
                                })}
                            </AppText>
                        </View>
                    ) : null}
                </View>
            </AppearingView>
        </View>
    );
};
