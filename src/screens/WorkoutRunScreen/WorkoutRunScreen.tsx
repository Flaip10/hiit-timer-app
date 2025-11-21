import { useMemo } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { useWorkout } from '@state/useWorkouts';
import { buildSteps } from '@core/timer';

import { MainContainer } from '@components/layout/MainContainer';
import { FooterBar } from '@components/layout/FooterBar';
import { Button } from '@components/ui/Button/Button';

import st from './styles';
import { PhaseArc } from './components/PhaseArc/PhaseArc';
import { ExerciseInfoCard } from './components/ExerciseInfoCard/ExerciseInfoCard';
import { NextExerciseCarousel } from './components/NextExerciseCarousel/NextExerciseCarousel';
import { FinishedCard } from './components/FinishedCard/FinishedCard';
import { PhasePill } from './components/PhasePill/PhasePill';
import { WorkoutMetaStrip } from './components/WorkoutMetaStrip/WorkoutMetaStrip';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colorFor, formatDuration, labelFor } from './helpers';
import { useWorkoutRun } from './hooks/useWorkoutRun';

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
        breathingPhase,
        handlePrimary,
        handleSkip,
        handleEnd,
        handleDone,
    } = useWorkoutRun({ steps, workout, shouldAutoStart, router });

    const timerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 + breathingPhase.value * 0.08 }],
    }));

    // -------- empty / not found state --------

    if (!workout || steps.length === 0 || !step) {
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

    // -------- visual mapping from phase --------

    const phaseColor = colorFor(phase, !!isSetRest);
    const phaseLabel = labelFor(phase, !!isSetRest);

    return (
        <>
            <MainContainer scroll={false}>
                {/* Workout header */}
                <View style={st.pageHeader}>
                    <Text
                        style={st.runWorkoutTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {workout.name}
                    </Text>
                    {!isFinished && (
                        <View style={st.workoutTimerContainer}>
                            <Feather
                                name="clock"
                                size={16}
                                color="#F9FAFB"
                                style={st.workoutTimerIcon}
                            />
                            <View style={st.workoutTimerTextWrapper}>
                                <Text style={st.workoutTimerText}>
                                    {formatDuration(remainingWorkoutSec)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Meta strip */}
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
                            breathingPhase={breathingPhase}
                        />
                        <Animated.Text style={[st.timer, timerAnimatedStyle]}>
                            {isFinished ? 0 : remaining}
                        </Animated.Text>
                    </View>
                </View>

                {/* CURRENT + NEXT EXERCISE */}
                <View style={st.exerciseInfoContainer}>
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
                                    { backgroundColor: phaseColor },
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
