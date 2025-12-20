import { useEffect, useMemo } from 'react';
import {
    cancelAnimation,
    Easing,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import type { Step } from '@core/timer';

type UseBreathingAnimationArgs = {
    step: Step | undefined;
    remaining: number;
    running: boolean;
    isFinished: boolean;
};

export const useBreathingAnimation = ({
    step,
    remaining,
    running,
    isFinished,
}: UseBreathingAnimationArgs) => {
    const breathingPhase = useSharedValue(0);

    // Run in the last 3 seconds of each step
    const isBreathingWindow = useMemo(() => {
        if (!step || !step.durationSec) return false;
        return remaining > 0 && remaining <= 3;
    }, [step, remaining]);

    // Only animate when in the window *and* actually running
    const shouldAnimateBreathing = isBreathingWindow && running;

    useEffect(() => {
        cancelAnimation(breathingPhase);

        if (isFinished) {
            breathingPhase.value = withTiming(0, {
                duration: 150,
                easing: Easing.out(Easing.quad),
            });
            return;
        }

        if (!isBreathingWindow) {
            breathingPhase.value = withTiming(0, {
                duration: 150,
                easing: Easing.out(Easing.quad),
            });
            return;
        }

        if (!shouldAnimateBreathing) {
            // paused inside the window → freeze
            return;
        }

        breathingPhase.value = withRepeat(
            withSequence(
                withTiming(1, {
                    duration: 500,
                    easing: Easing.linear,
                }),
                withTiming(0, {
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                })
            ),
            -1,
            false
        );
    }, [isBreathingWindow, shouldAnimateBreathing, isFinished, breathingPhase]);

    return {
        breathingPhase,
    };
};
