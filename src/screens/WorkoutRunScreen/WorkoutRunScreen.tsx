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
import { colorFor, phaseLabelKeyFor } from './helpers';
import { RunTopSection } from './components/RunTopSection/RunTopSection';
import { RunPhaseSection } from './components/RunPhaseSection/RunPhaseSection';
import { RunFooter } from './components/RunFooter/RunFooter';

import useStepBeeps from './hooks/useStepBeeps';
import { useWorkoutHistory } from '@src/state/stores/useWorkoutHistory';
import { useSettingsStore } from '@src/state/useSettingsStore';
import { prepareRunData } from '@src/core/timer';
import { useTheme } from '@src/theme/ThemeProvider';
import { useSystemBackHandler } from '@src/hooks/navigation/useSystemBackHandler';
import { useTranslation } from 'react-i18next';

export const WorkoutRunScreen = () => {
    const { t } = useTranslation();
    useKeepAwake();
    const router = useRouter();
    const { theme } = useTheme();

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
            remainingSec,
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

    const { allowNextBack } = useSystemBackHandler({
        onSystemBack: () => {
            if (!isFinished) handleRequestEnd();
            else handleDone();
            return true;
        },
        isGestureBackDisabled: true,
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

    // -------- Calculate total duration when finished --------
    const totalDurationSec = useMemo(() => {
        if (!isFinished) {
            return undefined;
        }
        const totalSec =
            runStats.totalWorkSec +
            runStats.totalRestSec +
            runStats.totalPausedSec +
            runStats.totalBlockPauseSec;
        return totalSec > 0 ? totalSec : undefined;
    }, [
        isFinished,
        runStats.totalWorkSec,
        runStats.totalRestSec,
        runStats.totalPausedSec,
        runStats.totalBlockPauseSec,
    ]);

    // -------- empty / not found state --------

    if (!workout || plan.steps.length === 0) {
        return (
            <>
                <MainContainer title={t('run.title')} scroll={false}>
                    <View style={st.emptyContainer}>
                        <AppText variant="title2" style={st.emptyTitle}>
                            {t('run.emptyTitle')}
                        </AppText>
                        <AppText variant="bodySmall" style={st.emptyText}>
                            {t('run.emptyDescription')}
                        </AppText>
                    </View>
                </MainContainer>
                <FooterBar>
                    <Button
                        title={t('common.actions.back')}
                        variant="secondary"
                        onPress={() => router.back()}
                        flex={1}
                    />
                </FooterBar>
            </>
        );
    }

    // -------- visual mapping from phase --------

    const phaseColor = isFinished
        ? theme.palette.accent.primary
        : colorFor(phase, !!isSetRest);
    const phaseLabel = t(phaseLabelKeyFor(phase, !!isSetRest));

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
        allowNextBack();
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
                    runStats={runStats}
                    totalDurationSec={totalDurationSec}
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
                    title={t('run.confirmEnd.title')}
                    message={t('run.confirmEnd.message')}
                    confirmLabel={t('run.confirmEnd.confirm')}
                    cancelLabel={t('run.confirmEnd.cancel')}
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
                    onShare={openSharePreview}
                    isBlockPause={awaitingBlockContinue}
                />
            </FooterBar>
        </>
    );
};

export default WorkoutRunScreen;
