import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Modal } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { useWorkout, useWorkouts } from '@state/useWorkouts';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';

import useWorkoutRunStyles from './WorkoutRunScreen.styles';
import { ShareWorkoutCard } from './components/ShareWorkoutCard/ShareWorkoutCard';
import { useWorkoutRun } from './hooks/useWorkoutRun';
import { colorFor, labelFor } from './helpers';
import { RunTopSection } from './components/RunTopSection/RunTopSection';
import { RunPhaseSection } from './components/RunPhaseSection/RunPhaseSection';
import { RunFooter } from './components/RunFooter/RunFooter';

import useStepBeeps from './hooks/useStepBeeps';
import { useWorkoutHistory } from '@src/state/stores/useWorkoutHistory';
import { prepareRunData } from '@src/core/timer';

export const WorkoutRunScreen = () => {
    useKeepAwake();
    const router = useRouter();

    const st = useWorkoutRunStyles();

    const [shareVisible, setShareVisible] = useState(false);
    const [endConfirmVisible, setEndConfirmVisible] = useState(false);
    const shareCardRef = useRef<View | null>(null);

    const { id, autoStart, mode, origin } = useLocalSearchParams<{
        id?: string;
        autoStart?: string;
        mode?: 'quick';
        origin?: 'quick' | 'history';
    }>();

    const savedWorkout = useWorkout(id);
    const draftWorkout = useWorkouts((s) => s.draft);

    const workout = mode === 'quick' ? draftWorkout : savedWorkout;
    const shouldAutoStart =
        autoStart === '1' || autoStart === 'true' || autoStart === 'yes';

    const clearDraft = useWorkouts((s) => s.clearDraft);

    const plan = useMemo(() => prepareRunData(workout, 5), [workout]);

    const meta = plan.meta;

    const {
        timer: {
            stepIndex,
            remainingSec: remainingSec,
            running,
            step,
            phase,
            isSetRest,
            remainingBlockSec,
            isFinished,
            primaryLabel,
        },
        runContext: workoutContext,
        gates: { awaitingBlockContinue },
        breathing: { breathingPhase },
        controls: { handlePrimary, handleSkip, handleForceFinish },
        stats: runStats,
    } = useWorkoutRun({ plan, shouldAutoStart });

    useStepBeeps({
        stepKey: step?.id ?? `none-${meta.runKey}`,
        running,
        remainingSec,
        stepDurationSec: step?.durationSec,
        enabled: !!step,
    });

    // ----- Block info --------

    const currentBlockIdx = workoutContext.currentBlockIdx;
    const currentBlock = workout?.blocks[currentBlockIdx] ?? null;

    const currentBlockTitle = meta.blockTitles[currentBlockIdx];

    const totalExercisesInWorkout = meta.totalExercisesForRun ?? 0;
    const totalSetsInWorkout = meta.totalSetsForRun ?? 0;

    const totalSetsInBlock = meta.plannedSetsByBlock[currentBlockIdx] ?? 0;

    const totalExercisesInBlock =
        meta.exercisesCountByBlock[currentBlockIdx] ?? 0;

    // --------  Session History Logic ---------
    const MIN_SESSION_SEC = 0;

    const startedAtMsRef = useRef<number | null>(null);
    const sessionSavedRef = useRef(false);

    useEffect(() => {
        startedAtMsRef.current = null;
        sessionSavedRef.current = false;
    }, [meta.runKey]);

    useEffect(() => {
        if (sessionSavedRef.current) return;

        // first transition into running => stamp start
        if (running && startedAtMsRef.current == null) {
            startedAtMsRef.current = Date.now();
            return;
        }

        // once finished => save (if we have a start)
        if (!isFinished) return;

        const startedAtMs = startedAtMsRef.current;
        if (startedAtMs == null) return;

        const endedAtMs = Date.now();
        const totalSec = Math.round((endedAtMs - startedAtMs) / 1000);

        if (totalSec < MIN_SESSION_SEC) return;
        if (!workout) return;

        const workoutId =
            mode !== 'quick' && typeof id === 'string' && id.length > 0
                ? id
                : undefined;

        useWorkoutHistory.getState().addSession({
            workoutSnapshot: workout,
            workoutId,
            startedAtMs,
            endedAtMs,
            stats: runStats,
        });

        sessionSavedRef.current = true;
    }, [running, isFinished, workout, runStats, mode, id]);

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

    // ----- handlers --------

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
        if (running) handlePrimary(); // pause
        setEndConfirmVisible(true);
    };

    const handleConfirmEnd = () => {
        setEndConfirmVisible(false);
        handleForceFinish();
    };

    const handleCancelEnd = () => {
        setEndConfirmVisible(false); // no auto-resume
    };

    const handleDone = () => {
        router.replace('/(drawer)');

        const shouldClearDraft = mode === 'quick' && origin === 'quick';
        if (shouldClearDraft) {
            requestAnimationFrame(() => {
                clearDraft();
            });
        }
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
                    currentBlockIndex={workoutContext.currentBlockIdx}
                    totalBlocks={meta.totalBlocks}
                    currentBlockTitle={currentBlockTitle}
                    totalExercisesInBlock={totalExercisesInBlock}
                    currentExerciseIndexInBlock={
                        workoutContext.currentExerciseIndexInBlock
                    }
                    isBlockPause={awaitingBlockContinue}
                    isRunning={running}
                    currentStep={step}
                    stepIndex={stepIndex}
                    meta={meta}
                    totalSetsInBlock={totalSetsInBlock}
                    totalSetsInWorkout={totalSetsInWorkout}
                    totalExercisesInWorkout={totalExercisesInWorkout}
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
                    currentBlockIndex={workoutContext.currentBlockIdx}
                    remainingSec={remainingSec}
                    breathingPhase={breathingPhase}
                    currentExerciseName={workoutContext.currentExerciseName}
                    nextExerciseName={workoutContext.nextExerciseName}
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
