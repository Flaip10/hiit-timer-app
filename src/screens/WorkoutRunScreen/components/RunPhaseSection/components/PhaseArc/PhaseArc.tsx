import React, { useEffect, useRef } from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SharedValue } from 'react-native-reanimated';
import Reanimated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    cancelAnimation,
    clamp,
} from 'react-native-reanimated';

import { useTheme } from '@src/theme/ThemeProvider';
import { ARC_SIZE } from '../../RunPhaseSection.styles';
import type { Step } from '@src/core/timer';

const AnimatedPath = Reanimated.createAnimatedComponent(Path);

const SVG_PADDING = 10;

const ARC_STROKE = 17;
const ARC_RADIUS = (ARC_SIZE - ARC_STROKE) / 2;

const ARC_SWEEP_DEG = 240;
const ARC_SWEEP_RAD = (ARC_SWEEP_DEG * Math.PI) / 180;
const ARC_LENGTH = ARC_RADIUS * ARC_SWEEP_RAD;

const GLOW_DELAY = 0;

const polarToCartesian = (
    cx: number,
    cy: number,
    radius: number,
    angleDeg: number
) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + radius * Math.cos(rad),
        y: cy + radius * Math.sin(rad),
    };
};

const describeArc = (
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
) => {
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);

    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1;
    const sweepFlag = 1;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
};

type PhaseArcProps = {
    color: string;
    finished: boolean;
    breathingPhase?: SharedValue<number>;
    currentStep: Step;
    isRunning: boolean;
};

export const PhaseArc = ({
    color,
    finished,
    breathingPhase,
    currentStep,
    isRunning,
}: PhaseArcProps) => {
    const { theme } = useTheme();
    const trackColor = theme.palette.background.card;
    // const trackColor = theme.palette.accent.soft;

    // Arc Dimensions consts
    const cx = ARC_SIZE / 2;
    const cy = ARC_SIZE / 2;
    const startAngle = -120;
    const endAngle = 120;
    const arcPath = describeArc(cx, cy, ARC_RADIUS, startAngle, endAngle);

    // Main Arc animation consts
    const arcProgress = useSharedValue(0);
    const animationStart = useRef(0);
    const elapsedTime = useRef(0);
    const lastStepId = useRef<string | number | null>(null);

    // Glow sweep progress (0..1 along the arc) and opacity
    const glowProgress = useSharedValue(0);
    const glowOpacity = useSharedValue(0);

    const prevFinished = useRef(false);

    // Main arc animation logic
    const desiredRunningSV = useSharedValue(isRunning);

    useEffect(() => {
        desiredRunningSV.value = isRunning;
    }, [isRunning, desiredRunningSV]);

    const isCollapsingSV = useSharedValue(false);

    useEffect(() => {
        const stepId = currentStep.id;
        const stepDurationMs = currentStep.durationSec * 1000;
        const collapseMs = 200;

        if (stepDurationMs <= 0) {
            cancelAnimation(arcProgress);
            arcProgress.value = 1;
            elapsedTime.current = 0;
            lastStepId.current = stepId;
            return;
        }

        const isNewStep = lastStepId.current !== stepId;
        lastStepId.current = stepId;

        // 1) NEW STEP: ALWAYS collapse to 0 (never cancel it)
        if (isNewStep) {
            cancelAnimation(arcProgress);

            // Important: collapse is visual only. It should NOT consume workout time.
            elapsedTime.current = 0;
            animationStart.current = performance.now();

            isCollapsingSV.value = true;

            arcProgress.value = withTiming(
                0,
                { duration: collapseMs, easing: Easing.linear },
                (collapseFinished) => {
                    'worklet';
                    isCollapsingSV.value = false;
                    if (!collapseFinished) return;

                    // After collapse:
                    // - if paused => stay at 0
                    // - if running => start forward fill
                    if (!desiredRunningSV.value) return;

                    arcProgress.value = withTiming(1, {
                        duration: stepDurationMs - collapseMs,
                        easing: Easing.linear,
                    });
                }
            );

            return;
        }

        // 2) PAUSE
        // If we're collapsing: do NOTHING (let collapse finish and then stop at 0)
        if (!isRunning) {
            if (isCollapsingSV.value) return;

            const now = performance.now();
            elapsedTime.current += now - animationStart.current;
            cancelAnimation(arcProgress); // freeze forward fill
            return;
        }

        // 3) RESUME / NORMAL RUN
        // If we're collapsing: do NOTHING (collapse callback will decide what happens next)
        if (isCollapsingSV.value) return;

        const remaining = Math.max(0, stepDurationMs - elapsedTime.current);

        if (remaining === 0) {
            cancelAnimation(arcProgress);
            arcProgress.value = 1;
            return;
        }

        animationStart.current = performance.now();
        arcProgress.value = withTiming(1, {
            duration: remaining,
            easing: Easing.linear,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, currentStep.id]);

    // One-shot glow sweep when we enter "finished"
    useEffect(() => {
        const wasFinished = prevFinished.current;

        if (!wasFinished && finished) {
            cancelAnimation(glowProgress);
            cancelAnimation(glowOpacity);

            glowProgress.value = 0;
            glowOpacity.value = 0;

            glowOpacity.value = withDelay(
                GLOW_DELAY,
                withSequence(
                    withTiming(1, {
                        duration: 500,
                        easing: Easing.in(Easing.cubic),
                    }),

                    withTiming(0, {
                        duration: 700,
                        easing: Easing.out(Easing.cubic),
                    })
                )
            );

            glowProgress.value = withDelay(
                GLOW_DELAY,
                withTiming(1, {
                    duration: 1000,
                    easing: Easing.inOut(Easing.cubic),
                })
            );
        }

        prevFinished.current = finished;
    }, [finished, glowProgress, glowOpacity]);

    const mainProps = useAnimatedProps(() => {
        const progress = clamp(arcProgress.value, 0, 1);

        return {
            strokeDashoffset: ARC_LENGTH * (1 - progress),
        };
    });

    const glowProps = useAnimatedProps(() => {
        const progress = clamp(glowProgress.value, 0, 1);

        return {
            strokeDashoffset: ARC_LENGTH * (1 - progress),
            opacity: glowOpacity.value * 0.9,
        };
    });

    const breathingProps = useAnimatedProps(() => {
        const progress = clamp(arcProgress.value, 0, 1);
        const breath = clamp(breathingPhase ? breathingPhase.value : 0, 0, 1);

        return {
            strokeDashoffset: ARC_LENGTH * (1 - progress),
            opacity: breath * 0.6,
        };
    });

    return (
        <Svg
            width={ARC_SIZE + SVG_PADDING * 2}
            height={ARC_SIZE + SVG_PADDING * 2}
            viewBox={`${-SVG_PADDING} ${-SVG_PADDING} ${
                ARC_SIZE + SVG_PADDING * 2
            } ${ARC_SIZE + SVG_PADDING * 2}`}
        >
            {/* Background track */}
            <Path
                d={arcPath}
                stroke={trackColor}
                strokeWidth={ARC_STROKE}
                fill="transparent"
                strokeLinecap="round"
            />

            {/* Breathing halo – pulsates when breathingPhase > 0 */}
            <AnimatedPath
                d={arcPath}
                stroke={color}
                strokeWidth={ARC_STROKE + 8}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
                animatedProps={breathingPhase ? breathingProps : mainProps}
            />

            {/* Glow sweep (thicker, fades out) */}
            <AnimatedPath
                d={arcPath}
                stroke={color}
                strokeWidth={ARC_STROKE + 8}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
                animatedProps={glowProps}
            />

            {/* Main phase arc – just follows normal progress */}
            <AnimatedPath
                d={arcPath}
                stroke={color}
                strokeWidth={ARC_STROKE}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
                animatedProps={mainProps}
            />
        </Svg>
    );
};
