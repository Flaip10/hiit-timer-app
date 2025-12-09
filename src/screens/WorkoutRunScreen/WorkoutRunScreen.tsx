import { useMemo, useRef, useState } from 'react';
import { View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { useWorkout } from '@state/useWorkouts';
import { buildSteps } from '@core/timer';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppText } from '@src/components/ui/Typography/AppText';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';

import useWorkoutRunStyles from './WorkoutRunScreen.styles';
import { FinishedCard } from './components/FinishedCard/FinishedCard';
import { ShareWorkoutCard } from './components/ShareWorkoutCard/ShareWorkoutCard';
import { useWorkoutRun } from './hooks/useWorkoutRun';
import { colorFor, labelFor } from './helpers';
import { useTheme } from '@src/theme/ThemeProvider';
import { RunTopSection } from './components/RunTopSection/RunTopSection';
import { RunPhaseSection } from './components/RunPhaseSection/RunPhaseSection';
import { RunFooter } from './components/RunFooter/RunFooter';

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
        completedSetsByBlock,
        elapsedCompletedSec,
        isFullyCompleted,
        breathingPhase,
        handlePrimary,
        handleSkip,
        handleEnd, // kept for future reuse if needed
        handleDone,
        handleForceFinish,
    } = useWorkoutRun({ steps, workout, shouldAutoStart, router });

    // Planned total duration (excluding PREP, to match "time left" logic)
    const totalWorkoutPlannedSec = useMemo(
        () =>
            steps.reduce((acc, s) => {
                if (s.label === 'PREP') return acc;
                return acc + (s.durationSec ?? 0);
            }, 0),
        [steps]
    );

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

    const isBlockPause = awaitingBlockContinue && !!currentBlock;

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
                {/* TOP SECTION */}
                <RunTopSection
                    workoutName={workout.name}
                    isFinished={isFinished}
                    remainingWorkoutSec={remainingWorkoutSec}
                    totalWorkoutPlannedSec={totalWorkoutPlannedSec}
                    phaseColor={phaseColor}
                    stepBlockIdx={step.blockIdx}
                    currentBlockTitle={currentBlock?.title ?? null}
                    currentSetIndex={step.setIdx}
                    totalSets={totalSets}
                    setProgress={setProgress}
                    isBlockPause={isBlockPause}
                />

                {/* PHASE / ARC / EXERCISES */}
                <RunPhaseSection
                    phase={phase}
                    phaseColor={phaseColor}
                    phaseLabel={phaseLabel}
                    isFinished={isFinished}
                    awaitingBlockContinue={awaitingBlockContinue}
                    currentBlock={currentBlock}
                    currentBlockIndex={currentBlockIndex}
                    remaining={remaining}
                    phaseProgress={phaseProgress}
                    breathingPhase={breathingPhase}
                    currentExerciseName={currentExerciseName}
                    nextExerciseName={nextExerciseName}
                />

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
                <RunFooter
                    isFinished={isFinished}
                    phaseColor={phaseColor}
                    running={running}
                    primaryLabel={primaryLabel}
                    onPrimary={handlePrimary}
                    onSkip={handleSkip}
                    onRequestEnd={handleRequestEnd}
                    onDone={handleDone}
                />
            </FooterBar>
        </>
    );
};

export default WorkoutRunScreen;
