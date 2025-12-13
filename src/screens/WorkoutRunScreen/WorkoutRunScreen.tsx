import { useMemo, useRef, useState } from 'react';
import { View, Modal } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { useWorkout } from '@state/useWorkouts';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';

import useWorkoutRunStyles from './WorkoutRunScreen.styles';
import { ShareWorkoutCard } from './components/ShareWorkoutCard/ShareWorkoutCard';
import { useWorkoutRun } from './hooks/useWorkoutRun';
import { colorFor, getSetStepsForCurrentStep, labelFor } from './helpers';
import { RunTopSection } from './components/RunTopSection/RunTopSection';
import { RunPhaseSection } from './components/RunPhaseSection/RunPhaseSection';
import { RunFooter } from './components/RunFooter/RunFooter';
import { useRunBuilder } from './hooks/useRunBuilder';

export const WorkoutRunScreen = () => {
    useKeepAwake();

    const st = useWorkoutRunStyles();

    const [shareVisible, setShareVisible] = useState(false);
    const [endConfirmVisible, setEndConfirmVisible] = useState(false);
    const shareCardRef = useRef<View | null>(null);

    const { id, autoStart } = useLocalSearchParams<{
        id?: string;
        autoStart?: string;
    }>();
    const router = useRouter();
    const workout = useWorkout(id);

    const shouldAutoStart =
        autoStart === '1' || autoStart === 'true' || autoStart === 'yes';

    const plan = useRunBuilder({ workout, prepSec: 5 });

    const {
        // raw timer state
        remaining,
        running,

        // derived timer info
        step,
        phase,
        isSetRest,
        remainingBlockSec,
        isFinished,
        primaryLabel,

        // workout structure / names
        totalSetsInBlock,
        currentBlockIndex,
        currentExerciseName,
        nextExerciseName,
        currentExerciseIndexInBlock,
        totalExercisesInBlock,

        // completion info
        completedSetsByBlock,
        elapsedCompletedSec,
        isFullyCompleted,
        awaitingBlockContinue,

        // breathing scalar for UI (0..1)
        breathingPhase,

        // controls
        handlePrimary,
        handleSkip,
        handleDone,
        handleForceFinish,
    } = useWorkoutRun({ plan, shouldAutoStart, router });

    const currentBlock =
        currentBlockIndex != null
            ? (workout?.blocks[currentBlockIndex] ?? null)
            : null;

    const setSteps = useMemo(() => {
        if (!step) return [];
        return getSetStepsForCurrentStep(plan.steps, step).setSteps;
    }, [plan.steps, step]);

    // Planned total duration (excluding PREP, to match "time left" logic)
    const totalWorkoutPlannedSec = useMemo(
        () =>
            plan.steps.reduce((acc, s) => {
                if (s.label === 'PREP') return acc;
                return acc + (s.durationSec ?? 0);
            }, 0),
        [plan.steps]
    );

    // -------- empty / not found state --------

    if (!workout || plan.steps.length === 0 || !step) {
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
        if (running) handlePrimary();
        setEndConfirmVisible(true);
    };

    const handleConfirmEnd = () => {
        setEndConfirmVisible(false);
        handleForceFinish();
    };

    const handleCancelEnd = () => {
        handlePrimary();
        setEndConfirmVisible(false);
    };

    return (
        <>
            <MainContainer scroll={false}>
                {/* TOP SECTION */}
                <RunTopSection
                    workoutName={workout.name}
                    isFinished={isFinished}
                    remainingBlockSec={remainingBlockSec}
                    phaseColor={phaseColor}
                    currentBlockIndex={currentBlockIndex}
                    totalBlocks={plan.totalBlocks}
                    currentBlockTitle={currentBlock?.title}
                    totalExercisesInBlock={totalExercisesInBlock}
                    currentExerciseIndexInBlock={currentExerciseIndexInBlock}
                    isBlockPause={awaitingBlockContinue}
                    isRunning={running}
                    setSteps={setSteps}
                    currentStep={step}
                    totalSetsInBlock={totalSetsInBlock}
                />

                {/* PHASE / ARC / EXERCISES / FINISHED CARD */}
                <RunPhaseSection
                    currentStep={step}
                    isRunning={running}
                    phase={phase}
                    phaseColor={phaseColor}
                    phaseLabel={phaseLabel}
                    isFinished={isFinished}
                    awaitingBlockContinue={awaitingBlockContinue}
                    currentBlock={currentBlock}
                    currentBlockIndex={currentBlockIndex}
                    remaining={remaining}
                    breathingPhase={breathingPhase}
                    currentExerciseName={currentExerciseName}
                    nextExerciseName={nextExerciseName}
                    openSharePreview={openSharePreview}
                />

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
                    isBlockPause={awaitingBlockContinue}
                />
            </FooterBar>
        </>
    );
};

export default WorkoutRunScreen;
