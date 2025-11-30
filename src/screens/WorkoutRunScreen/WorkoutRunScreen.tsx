import { useMemo, useRef, useState } from 'react';
import { Text, View, TouchableOpacity, Modal } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

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
import {
    colorFor,
    formatDuration,
    formatDurationVerbose,
    labelFor,
} from './helpers';
import { useWorkoutRun } from './hooks/useWorkoutRun';
import { ShareWorkoutCard } from './components/ShareWorkoutCard/ShareWorkoutCard';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';

export const WorkoutRunScreen = () => {
    useKeepAwake();

    const [shareVisible, setShareVisible] = useState(false);
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
        breathingPhase,
        handlePrimary,
        handleSkip,
        handleEnd,
        handleDone,
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
            console.warn('Share failed', err);
        }
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
                            <Text
                                style={st.runWorkoutTitle}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {workout.name}
                            </Text>

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
                        </View>

                        {/* Meta strip only while running */}
                        <WorkoutMetaStrip
                            blockIndex={step.blockIdx}
                            blockTitle={currentBlock?.title}
                            currentSetIndex={step.setIdx}
                            totalSets={totalSets}
                            setProgress={setProgress}
                            phaseColor={phaseColor}
                        />
                    </AppearingView>

                    <AppearingView
                        visible={isFinished}
                        style={st.pageHeader}
                        offsetY={0}
                        offsetX={-12}
                        delay={260} //Provide enough time for previous view to unmount
                    >
                        <View>
                            <Text style={st.finishedTitle}>
                                Workout complete
                            </Text>

                            <Text
                                style={st.finishedSubtitle}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {workout.name}
                            </Text>
                        </View>
                        <View style={st.finishedDurationPillContainer}>
                            <View style={st.finishedDurationPill}>
                                <Feather
                                    name="clock"
                                    size={16}
                                    color="#F9FAFB"
                                    style={st.workoutTimerIcon}
                                />

                                <Text style={st.finishedDurationText}>
                                    {formatDurationVerbose(
                                        totalWorkoutPlannedSec
                                    )}
                                </Text>
                            </View>
                        </View>
                    </AppearingView>
                </View>

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

                {/* Share preview modal – only used on finished state */}

                <AppearingView
                    visible={isFinished}
                    style={st.finishedFooterRow}
                >
                    <TouchableOpacity
                        onPress={openSharePreview}
                        activeOpacity={0.8}
                        style={st.finishedShareButton}
                    >
                        <Ionicons
                            name="share-outline"
                            size={22}
                            color="#E5E7EB"
                        />
                    </TouchableOpacity>
                </AppearingView>

                {isFinished && (
                    <Modal
                        visible={shareVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={closeSharePreview}
                    >
                        <View style={st.shareModalBackdrop}>
                            <View style={st.shareModalContent}>
                                <View
                                    ref={shareCardRef}
                                    collapsable={false} // important for Android + view-shot
                                >
                                    <ShareWorkoutCard
                                        workoutName={workout.name}
                                        durationLabel={formatDurationVerbose(
                                            totalWorkoutPlannedSec
                                        )}
                                        completedLabel="Today" // later you can pass a real date string
                                        phaseColor={phaseColor}
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
            </MainContainer>

            {/* FOOTER BUTTONS */}
            <FooterBar>
                {isFinished ? (
                    <View style={st.footerFinishedWrapper}>
                        <TouchableOpacity
                            onPress={handleDone}
                            activeOpacity={0.9}
                            style={st.footerFinishedButton}
                        >
                            <Text style={st.footerFinishedText}>
                                Back to summary
                            </Text>
                        </TouchableOpacity>
                    </View>
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
