import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { useWorkout, useWorkouts } from '@state/useWorkouts';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { ShareWorkoutModal } from '@src/components/modals/ShareWorkoutModal/ShareWorkoutModal';

import useWorkoutRunStyles from './WorkoutRunScreen.styles';
import { useWorkoutRun } from './hooks/useWorkoutRun';
import { colorFor, labelFor } from './helpers';
import { RunTopSection } from './components/RunTopSection/RunTopSection';
import { RunPhaseSection } from './components/RunPhaseSection/RunPhaseSection';
import { RunFooter } from './components/RunFooter/RunFooter';

import useStepBeeps from './hooks/useStepBeeps';
import { useWorkoutHistory } from '@src/state/stores/useWorkoutHistory';
import { useSettingsStore } from '@src/state/useSettingsStore';
import { prepareRunData } from '@src/core/timer';

export const WorkoutRunScreen = () => {
    useKeepAwake();
    const router = useRouter();

    const st = useWorkoutRunStyles();

    const [shareVisible, setShareVisible] = useState(false);
    const [endConfirmVisible, setEndConfirmVisible] = useState(false);

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

    const isSoundEnabled = useSettingsStore((s) => s.isSoundEnabled);

    useStepBeeps({
        stepKey: step.id,
        running,
        remainingSec,
        stepDurationSec: step.durationSec,
        enabled: isSoundEnabled,
    });

    // ----- Block info --------

    const currentBlockIdx = workoutContext.currentBlockIdx;
    const currentBlock = workout?.blocks[currentBlockIdx] ?? null;

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

    if (!workout || plan.steps.length === 0) {
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
                    currentBlockIdx={workoutContext.currentBlockIdx}
                    currentExerciseIndexInBlock={
                        workoutContext.currentExerciseIndexInBlock
                    }
                    isBlockPause={awaitingBlockContinue}
                    isRunning={running}
                    currentStep={step}
                    stepIndex={stepIndex}
                    meta={meta}
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
                    openSharePreview={openSharePreview}
                />

                {/* Share preview modal – only used on finished state */}
                {isFinished && (
                    <ShareWorkoutModal
                        visible={shareVisible}
                        onClose={closeSharePreview}
                        workout={workout}
                        runStats={runStats}
                    />
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
