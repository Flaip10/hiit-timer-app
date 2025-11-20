import { useMemo } from 'react';
import { Animated, Text, View, TouchableOpacity } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { useWorkout } from '@state/useWorkouts';
import { buildSteps, type Phase } from '@core/timer';

import { MainContainer } from '@components/layout/MainContainer';
import { FooterBar } from '@components/layout/FooterBar';
import { Button } from '@components/ui/Button/Button';

import st from './styles';
import { PhaseArc } from './PhaseArc';
import { ExerciseInfoCard } from './ExerciseInfoCard';
import { NextExerciseCarousel } from './NextExerciseCarousel';
import { FinishedCard } from './FinishedCard';
import { PhasePill } from './PhasePill';
import { WorkoutMetaStrip } from './WorkoutMetaStrip';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
    colorFor,
    computeRemainingWorkoutSec,
    computeSetProgress,
    formatDuration,
    labelFor,
} from './helpers';
import { useWorkoutRun } from './useWorkoutRun';

export const WorkoutRunScreen = () => {
    useKeepAwake();

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
        stepIndex,
        remaining,
        remainingMs,
        running,
        scaleAnim,
        handleStart,
        handlePause,
        handleResume,
        handleSkip,
        handleEnd,
        handleDone,
    } = useWorkoutRun({ steps, shouldAutoStart, router });

    // -------- empty / not found state --------

    if (!workout || steps.length === 0) {
        return (
            <>
                <MainContainer title="Run workout" scroll={false}>
                    <View style={st.emptyContainer}>
                        <Text style={st.emptyTitle}>No steps to run</Text>
                        <Text style={st.emptyText}>
                            This workout has no timed steps configured.
                        </Text>
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

    // -------- derived data from current step --------

    const step = steps[stepIndex];
    const phase = step.label as Phase;
    const isSetRest = phase === 'REST' && step.id.startsWith('rest-set-');
    const phaseColor = colorFor(phase, isSetRest);
    const phaseLabel = labelFor(phase, isSetRest);

    const currentBlock = workout.blocks[step.blockIdx];
    const totalSets = currentBlock?.scheme.sets ?? 0;

    const isFinished =
        !running && stepIndex === steps.length - 1 && remaining <= 0;

    const durationMs = (step?.durationSec ?? 0) * 1000;
    const safeRemainingMs =
        durationMs > 0 ? Math.max(0, Math.min(remainingMs, durationMs)) : 0;

    // continuous phase progress (0..1) based on ms
    const phaseProgress =
        durationMs > 0 ? (durationMs - safeRemainingMs) / durationMs : 0;

    // total workout time remaining (current partial step + later steps)
    const remainingWorkoutSec = computeRemainingWorkoutSec(
        steps,
        stepIndex,
        remaining
    );

    // progress within the *current set* (0..1, continuous based on ms)
    const setProgress = computeSetProgress(
        steps,
        steps[stepIndex],
        remainingMs
    );

    const getExerciseNameForStep = (
        s: (typeof steps)[number] | undefined
    ): string | null => {
        if (!s || s.label !== 'WORK') return null;
        const block = workout.blocks[s.blockIdx];
        const exercise = block?.exercises[s.exIdx];
        return exercise?.name ?? null;
    };

    let currentExerciseName: string | null = null;
    let nextExerciseName: string | null = null;

    if (phase === 'PREP') {
        // Look forward from the current step and collect the first 2 WORK steps
        const upcoming: (typeof steps)[number][] = [];

        for (let i = stepIndex; i < steps.length; i += 1) {
            const candidate = steps[i];
            if (candidate.label === 'WORK') {
                upcoming.push(candidate);
                if (upcoming.length === 2) break;
            }
        }

        const firstWork = upcoming[0];
        const secondWork = upcoming[1];

        currentExerciseName = getExerciseNameForStep(firstWork);
        nextExerciseName = getExerciseNameForStep(secondWork);
    } else {
        // CURRENT exercise for WORK / REST
        if (phase === 'WORK') {
            currentExerciseName = getExerciseNameForStep(step);
        } else if (phase === 'REST') {
            // last WORK before this REST
            for (let i = stepIndex - 1; i >= 0; i -= 1) {
                const prev = steps[i];
                if (prev.label === 'WORK') {
                    currentExerciseName = getExerciseNameForStep(prev);
                    break;
                }
            }
        }

        // NEXT exercise: first WORK step after this step
        for (let i = stepIndex + 1; i < steps.length; i += 1) {
            const future = steps[i];
            if (future.label === 'WORK') {
                nextExerciseName = getExerciseNameForStep(future);
                break;
            }
        }
    }

    const isAtStepStart = remaining === step.durationSec;

    const primaryLabel = isFinished
        ? 'Done'
        : running
          ? 'Pause'
          : isAtStepStart
            ? 'Start'
            : 'Resume';

    const handlePrimary = () => {
        if (isFinished) {
            handleDone();
            return;
        }

        if (running) {
            handlePause();
        } else if (isAtStepStart) {
            handleStart();
        } else {
            handleResume();
        }
    };

    return (
        <>
            <MainContainer scroll={false}>
                {/* Workout header */}
                <View style={st.runHeader}>
                    <Text
                        style={st.runWorkoutTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {workout.name}
                    </Text>
                    {!isFinished && (
                        <View style={st.metaStripTopCenter}>
                            <Feather
                                name="clock"
                                size={16}
                                color="#F9FAFB"
                                style={st.metaStripTimeIcon}
                            />
                            <View style={st.metaStripTimeTextWrapper}>
                                <Text style={st.metaStripTimeText}>
                                    {formatDuration(remainingWorkoutSec)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Meta strip at the very top of the content */}
                {!isFinished && (
                    <WorkoutMetaStrip
                        blockIndex={step.blockIdx}
                        blockTitle={currentBlock?.title}
                        currentSetIndex={step.setIdx}
                        totalSets={totalSets}
                        setProgress={setProgress}
                        phaseColor={phaseColor}
                    />
                )}
                {/* ARC + PHASE */}
                <View style={st.arcContainer}>
                    <PhasePill
                        color={phaseColor}
                        label={isFinished ? 'Done' : phaseLabel}
                        containerStyle={st.phasePill}
                        textStyle={st.phasePillText}
                    />

                    <View style={st.arcWrapper}>
                        <PhaseArc
                            progress={phaseProgress}
                            color={phaseColor}
                            finished={isFinished}
                        />
                        <Animated.Text
                            style={[
                                st.timer,
                                { transform: [{ scale: scaleAnim }] },
                            ]}
                        >
                            {isFinished ? 0 : remaining}
                        </Animated.Text>
                    </View>
                </View>

                {/* CURRENT + NEXT EXERCISE */}
                <View style={st.metaContainer}>
                    {!isFinished && currentExerciseName && (
                        <ExerciseInfoCard
                            phase={phase}
                            color={phaseColor}
                            currentExerciseName={currentExerciseName}
                        />
                    )}

                    {!isFinished && nextExerciseName && (
                        <NextExerciseCarousel
                            phase={phase}
                            label={nextExerciseName}
                        />
                    )}
                </View>

                {/* FINISHED CARD */}
                <FinishedCard visible={isFinished} />
            </MainContainer>

            {/* FOOTER BUTTONS */}
            <FooterBar>
                {isFinished ? (
                    <Button
                        title="Done"
                        variant="primary"
                        onPress={handleDone}
                        flex={1}
                    />
                ) : (
                    <View style={st.footerIconRow}>
                        {/* Skip (left) */}
                        <View style={st.footerIconWrapper}>
                            <TouchableOpacity
                                onPress={handleSkip}
                                activeOpacity={0.8}
                                style={st.footerRoundSecondary}
                            >
                                <Ionicons
                                    name="play-skip-forward"
                                    size={22}
                                    color="#E5E7EB"
                                />
                            </TouchableOpacity>
                            <Text style={st.footerIconLabel}>Skip</Text>
                        </View>

                        {/* Main play/pause button (center) */}
                        <View style={st.footerIconWrapper}>
                            <TouchableOpacity
                                onPress={handlePrimary}
                                activeOpacity={0.9}
                                style={[
                                    st.footerRoundPrimary,
                                    {
                                        backgroundColor: phaseColor,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={running ? 'pause' : 'play'}
                                    size={30}
                                    color="#0B0B0C"
                                />
                            </TouchableOpacity>
                            <Text style={st.footerIconLabel}>
                                {primaryLabel}
                            </Text>
                        </View>

                        {/* End (right) */}
                        <View style={st.footerIconWrapper}>
                            <TouchableOpacity
                                onPress={handleEnd}
                                activeOpacity={0.8}
                                style={st.footerRoundSecondary}
                            >
                                <Ionicons
                                    name="stop"
                                    size={22}
                                    color="#E5E7EB"
                                />
                            </TouchableOpacity>
                            <Text style={st.footerIconLabel}>End</Text>
                        </View>
                    </View>
                )}
            </FooterBar>
        </>
    );
};

export default WorkoutRunScreen;
