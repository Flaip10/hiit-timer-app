import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
    cancelAnimation,
    clamp,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import useWorkoutMetaStripStyles from './ProgressPill.styles';
import type { RunMeta, Step } from '@src/core/timer';
import { getProgressRangeFromMeta } from '@src/screens/WorkoutRunScreen/helpers';

interface ProgressPillProps {
    index: number;
    visualSetIdx: number;
    phaseColor: string;
    isRunning: boolean;
    currentStep: Step;
    stepIndex: number;
    meta: RunMeta;
}

export const ProgressPill: React.FC<ProgressPillProps> = ({
    index,
    visualSetIdx,
    phaseColor,
    isRunning,
    currentStep,
    stepIndex,
    meta,
}) => {
    const st = useWorkoutMetaStripStyles();

    const currentSetIndex = currentStep.setIdx;

    const isPast = index < visualSetIdx;

    // Progress must belong to the *real* set, not the visual one
    const isProgressOwner = index === currentStep.setIdx;

    const pillProgress = useSharedValue(0);

    const animationStart = useRef(0);
    const elapsedStepTime = useRef(0);
    const lastStepId = useRef<string | null>(null);

    const endProgressRef = useRef(0);
    const stepDurationMsRef = useRef(0);

    const transitionTime = 200;

    // If this pill becomes "past" or "future", freeze it deterministically.
    useEffect(() => {
        if (isPast) {
            cancelAnimation(pillProgress);
            pillProgress.value = withTiming(1, {
                duration: transitionTime,
                easing: Easing.linear,
            });
            return;
        }

        // “future” pill (not past and not the real current set) → keep empty
        // Use currentSetIndex (real set index), not visualSetIdx.
        const isFuture = index > currentSetIndex;
        if (isFuture && !isProgressOwner) {
            cancelAnimation(pillProgress);
            pillProgress.value = 0;
        }
    }, [isPast, index, currentSetIndex, isProgressOwner, pillProgress]);

    // Only the progress-owner pill runs the full timing logic.
    useEffect(() => {
        if (!isProgressOwner) return;

        const stepId = currentStep.id;
        const isNewStep = lastStepId.current !== stepId;
        lastStepId.current = stepId;

        const { stepDurationMs, startProgress, endProgress } =
            getProgressRangeFromMeta(meta, stepIndex, currentStep);

        // freeze steps (PREP excluded / rest-set special-case should return 1..1)
        if (stepDurationMs === 0) {
            cancelAnimation(pillProgress);
            pillProgress.value = withTiming(startProgress, {
                duration: transitionTime,
                easing: Easing.linear,
            });
            elapsedStepTime.current = 0;
            return;
        }

        endProgressRef.current = endProgress;
        stepDurationMsRef.current = stepDurationMs;

        if (isNewStep) {
            cancelAnimation(pillProgress);

            elapsedStepTime.current = 0;
            animationStart.current = performance.now();

            if (!isRunning) {
                pillProgress.value = withTiming(startProgress, {
                    duration: transitionTime,
                    easing: Easing.linear,
                });
                return;
            }

            pillProgress.value = withSequence(
                withTiming(startProgress, {
                    duration: transitionTime,
                    easing: Easing.linear,
                }),
                withTiming(endProgressRef.current, {
                    duration: stepDurationMsRef.current,
                    easing: Easing.linear,
                })
            );

            animationStart.current = performance.now();
            return;
        }

        // PAUSE
        if (!isRunning) {
            const now = performance.now();
            elapsedStepTime.current += now - animationStart.current;
            cancelAnimation(pillProgress);
            return;
        }

        // RESUME
        const remainingMs = Math.max(
            0,
            stepDurationMsRef.current - elapsedStepTime.current
        );

        if (remainingMs === 0) {
            cancelAnimation(pillProgress);
            pillProgress.value = withTiming(endProgressRef.current, {
                duration: transitionTime,
                easing: Easing.linear,
            });
            return;
        }

        animationStart.current = performance.now();
        pillProgress.value = withTiming(endProgressRef.current, {
            duration: remainingMs,
            easing: Easing.linear,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meta, isRunning, currentStep.id, currentStep.setIdx, isProgressOwner]);

    const fillStyle = useAnimatedStyle(() => {
        const p = clamp(pillProgress.value, 0, 1);

        return { width: `${p * 100}%` };
    });

    return (
        <View style={st.metaStripPillOuter}>
            <View style={st.metaStripPillRemainder} />
            <Animated.View
                style={[
                    st.metaStripPillFillAbsolute,
                    { backgroundColor: phaseColor },
                    fillStyle,
                ]}
            />
        </View>
    );
};
