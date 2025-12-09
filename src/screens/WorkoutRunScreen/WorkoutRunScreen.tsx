import { useMemo, useRef, useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { Feather, Ionicons } from '@expo/vector-icons';

import { useWorkout } from '@state/useWorkouts';
import { buildSteps } from '@core/timer';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppText } from '@src/components/ui/Typography/AppText';

import useWorkoutRunStyles from './WorkoutRunScreen.styles';
import { PhaseArc } from './components/PhaseArc/PhaseArc';
import { ExerciseInfoCard } from './components/ExerciseInfoCard/ExerciseInfoCard';
import { NextExerciseCarousel } from './components/NextExerciseCarousel/NextExerciseCarousel';
import { FinishedCard } from './components/FinishedCard/FinishedCard';
import { PhasePill } from './components/PhasePill/PhasePill';
import { WorkoutMetaStrip } from './components/WorkoutMetaStrip/WorkoutMetaStrip';
import {
    colorFor,
    formatDuration,
    formatDurationVerbose,
    labelFor,
} from './helpers';
import { useWorkoutRun } from './hooks/useWorkoutRun';
import { ShareWorkoutCard } from './components/ShareWorkoutCard/ShareWorkoutCard';
import { useTheme } from '@src/theme/ThemeProvider';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';

const AnimatedAppText = Animated.createAnimatedComponent(AppText);

export const WorkoutRunScreen = () => {
    useKeepAwake();

    const st = useWorkoutRunStyles();
    const { theme } = useTheme();

    const [shareVisible, setShareVisible] = useState(false);
    const [endConfirmVisible, setEndConfirmVisible] = useState(false);
    const shareCardRef = useRef<View | null>(null);

    const { id, autoStart } = useLocalSearchParams<{
        id?: string;
        autoStart?: string;
    }>();
    const router = useRouter();
    const workout = useWorkout(id);

    // Build steps from workout blocks
    const { steps } = useMemo(() => {
        if (!workout) {
            return {
                steps: [] as ReturnType<typeof buildSteps>['steps'],
            };
        }
        const built = buildSteps(5, workout.blocks);
        return { steps: built.steps };
    }, [workout]);

    const shouldAutoStart =
        autoStart === '1' || autoStart === 'true' || autoStart === 'yes';

    const {
        remaining,
        running,
        step,
        phase,
        isSetRest,
        phaseProgress,
        remainingWorkoutSec,
        setProgress,
        isFinished,
        primaryLabel,
        currentBlock,
        totalSets,
        currentExerciseName,
        nextExerciseName,
        currentBlockIndex,
        awaitingBlockContinue,
        breathingPhase,
        completedSetsByBlock,
        elapsedCompletedSec,
        isFullyCompleted,
        handlePrimary,
        handleSkip,
        // handleEnd,
        handleDone,
        handleForceFinish,
    } = useWorkoutRun({ steps, workout, shouldAutoStart, router });

    const timerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 + breathingPhase.value * 0.08 }],
    }));

    // Planned total duration (excluding PREP, to match "time left" logic)
    const totalWorkoutPlannedSec = useMemo(
        () =>
            steps.reduce((acc, s) => {
                if (s.label === 'PREP') return acc;
                return acc + (s.durationSec ?? 0);
            }, 0),
        [steps]
    );

    // Block pause state (between blocks, waiting for user to continue)
    const isBlockPause = awaitingBlockContinue && !!currentBlock;

    // Info for the "next block" MetaCard shown during block pause
    const blockPauseInfo = useMemo(() => {
        if (!currentBlock) return null;

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
    }, [currentBlock, currentBlockIndex]);

    // -------- empty / not found state --------

    if (!workout || steps.length === 0 || !step) {
        return (
            <>
                <MainContainer title="Run workout" scroll={false}>
                    <View style={st.emptyContainer}>
                        <AppText variant="title2" style={st.emptyTitle}>
                            No steps to run
                        </AppText>
                        <AppText variant="bodySmall" style={st.emptyText}>
                            This workout has no timed steps configured.
                        </AppText>
                    </View>
                </MainContainer>
                <FooterBar>
                    <Button
                        title="Back"
                        variant="secondary"
                        onPress={() => router.back()}
                        flex={1}
                    />
                </FooterBar>
            </>
        );
    }

    // -------- visual mapping from phase --------

    const phaseColor = colorFor(phase, !!isSetRest);
    const phaseLabel = labelFor(phase, !!isSetRest);

    const openSharePreview = () => {
        if (!isFinished) return;
        setShareVisible(true);
    };

    const closeSharePreview = () => {
        setShareVisible(false);
    };

    const handleConfirmShare = async () => {
        try {
            const node = shareCardRef.current;
            if (!node) return;

            const uri = await captureRef(node, {
                format: 'png',
                quality: 1,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            }

            setShareVisible(false);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Share failed', err);
        }
    };

    const handleRequestEnd = () => {
        setEndConfirmVisible(true);
    };

    const handleConfirmEnd = () => {
        setEndConfirmVisible(false);
        handleForceFinish();
    };

    const handleCancelEnd = () => {
        setEndConfirmVisible(false);
    };

    return (
        <>
            <MainContainer scroll={false}>
                <View style={st.topRegion}>
                    <AppearingView
                        visible={!isFinished}
                        style={st.pageHeader}
                        offsetY={0}
                        offsetX={-12}
                    >
                        {/* Running header */}
                        <View style={st.pageHeaderInfoContainer}>
                            <AppText
                                variant="title1"
                                style={st.runWorkoutTitle}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {workout.name}
                            </AppText>

                            <View style={st.workoutTimerContainer}>
                                <Feather
                                    name="clock"
                                    size={16}
                                    color={theme.palette.text.primary}
                                    style={st.workoutTimerIcon}
                                />

                                <AppText
                                    variant="title3"
                                    style={st.workoutTimerText}
                                >
                                    {formatDuration(remainingWorkoutSec)}
                                </AppText>
                            </View>
                        </View>

                        {/* Meta strip only while running and not in block pause */}
                        {!isBlockPause && (
                            <WorkoutMetaStrip
                                blockIndex={step.blockIdx}
                                blockTitle={currentBlock?.title}
                                currentSetIndex={step.setIdx}
                                totalSets={totalSets}
                                setProgress={setProgress}
                                phaseColor={phaseColor}
                            />
                        )}
                    </AppearingView>

                    <AppearingView
                        visible={isFinished}
                        style={st.pageHeader}
                        offsetY={0}
                        offsetX={-12}
                        delay={260} // Provide enough time for previous view to unmount
                    >
                        <View>
                            <AppText variant="title1" style={st.finishedTitle}>
                                Workout complete
                            </AppText>

                            <AppText
                                variant="bodySmall"
                                style={st.finishedSubtitle}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {workout.name}
                            </AppText>
                        </View>
                        <View style={st.finishedDurationPillContainer}>
                            <View style={st.finishedDurationPill}>
                                <Feather
                                    name="clock"
                                    size={16}
                                    color={theme.palette.text.primary}
                                    style={st.workoutTimerIcon}
                                />

                                <AppText
                                    variant="subtitle"
                                    style={st.finishedDurationText}
                                >
                                    {formatDurationVerbose(
                                        totalWorkoutPlannedSec
                                    )}
                                </AppText>
                            </View>
                        </View>
                    </AppearingView>
                </View>

                {/* ARC + PHASE / BLOCK PAUSE */}
                <View style={st.arcContainer}>
                    <PhasePill
                        color={phaseColor}
                        label={
                            isFinished
                                ? 'Done'
                                : isBlockPause
                                  ? 'Prepare'
                                  : phaseLabel
                        }
                    />

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
                                                    style={
                                                        st.blockPauseSetsText
                                                    }
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
                    {!isFinished && !isBlockPause && currentExerciseName && (
                        <ExerciseInfoCard
                            phase={phase}
                            color={phaseColor}
                            currentExerciseName={currentExerciseName}
                        />
                    )}

                    {!isFinished && !isBlockPause && nextExerciseName && (
                        <NextExerciseCarousel
                            phase={phase}
                            label={nextExerciseName}
                        />
                    )}
                </View>

                {/* FINISHED CARD */}
                <FinishedCard visible={isFinished} />

                {/* Share button (finished only) */}
                <AppearingView
                    visible={isFinished}
                    style={st.finishedFooterRow}
                >
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
                </AppearingView>

                {/* Share preview modal – only used on finished state */}
                {isFinished && (
                    <Modal
                        visible={shareVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={closeSharePreview}
                    >
                        <View style={st.shareModalBackdrop}>
                            <View style={st.shareModalContent}>
                                <View style={st.shareModalCardWrapper}>
                                    <ShareWorkoutCard
                                        workout={workout}
                                        phaseColor={phaseColor}
                                        shareRef={shareCardRef}
                                        completedSetsByBlock={
                                            completedSetsByBlock
                                        }
                                        elapsedCompletedSec={
                                            elapsedCompletedSec
                                        }
                                        totalWorkoutPlannedSec={
                                            totalWorkoutPlannedSec
                                        }
                                        isFullyCompleted={isFullyCompleted}
                                    />
                                </View>

                                <View style={st.shareModalButtonsRow}>
                                    <Button
                                        title="Cancel"
                                        variant="secondary"
                                        onPress={closeSharePreview}
                                        flex={1}
                                    />
                                    <View style={st.shareModalButtonsSpacer} />
                                    <Button
                                        title="Share"
                                        variant="primary"
                                        onPress={handleConfirmShare}
                                        flex={1}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}

                {/* End-workout confirmation dialog */}
                <ConfirmDialog
                    visible={endConfirmVisible}
                    title="End workout?"
                    message="Your progress so far will be saved in the summary."
                    confirmLabel="End workout"
                    cancelLabel="Keep going"
                    destructive
                    onConfirm={handleConfirmEnd}
                    onCancel={handleCancelEnd}
                />
            </MainContainer>

            {/* FOOTER BUTTONS */}
            <FooterBar>
                {isFinished ? (
                    <View style={st.footerFinishedWrapper}>
                        <Pressable
                            onPress={handleDone}
                            style={({ pressed }) =>
                                pressed
                                    ? [
                                          st.footerFinishedButton,
                                          st.footerFinishedButtonPressed,
                                      ]
                                    : [st.footerFinishedButton]
                            }
                        >
                            <AppText
                                variant="subtitle"
                                style={st.footerFinishedText}
                            >
                                Back to summary
                            </AppText>
                        </Pressable>
                    </View>
                ) : (
                    <View style={st.footerIconRow}>
                        {/* End button (with confirm) */}
                        <View style={st.footerIconWrapper}>
                            <CircleIconButton
                                onPress={handleRequestEnd}
                                variant="secondary"
                            >
                                <Ionicons
                                    name="stop"
                                    size={22}
                                    color={theme.palette.button.text.secondary}
                                />
                            </CircleIconButton>
                            <AppText
                                variant="caption"
                                style={st.footerIconLabel}
                            >
                                End
                            </AppText>
                        </View>

                        {/* Main play/pause button */}
                        <View style={st.footerIconWrapper}>
                            <CircleIconButton
                                onPress={handlePrimary}
                                variant="primary"
                                backgroundColor={phaseColor}
                                size={76}
                            >
                                <Ionicons
                                    name={running ? 'pause' : 'play'}
                                    size={30}
                                    color={theme.palette.text.inverted}
                                />
                            </CircleIconButton>
                            <AppText
                                variant="caption"
                                style={st.footerIconLabel}
                            >
                                {primaryLabel}
                            </AppText>
                        </View>

                        {/* Skip button */}
                        <View style={st.footerIconWrapper}>
                            <CircleIconButton
                                onPress={handleSkip}
                                variant="secondary"
                            >
                                <Ionicons
                                    name="play-skip-forward"
                                    size={22}
                                    color={theme.palette.button.text.secondary}
                                />
                            </CircleIconButton>
                            <AppText
                                variant="caption"
                                style={st.footerIconLabel}
                            >
                                Skip
                            </AppText>
                        </View>
                    </View>
                )}
            </FooterBar>
        </>
    );
};

export default WorkoutRunScreen;
