import React, { useEffect, useRef } from 'react';
import Svg, { Path } from 'react-native-svg';
import Reanimated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    SharedValue,
    cancelAnimation,
} from 'react-native-reanimated';

import { ARC_SIZE } from '../../WorkoutRunScreen.styles';
import { useTheme } from '@src/theme/ThemeProvider';

const AnimatedPath = Reanimated.createAnimatedComponent(Path);

const SVG_PADDING = 10;

const ARC_STROKE = 17;
const ARC_RADIUS = (ARC_SIZE - ARC_STROKE) / 2;

const ARC_SWEEP_DEG = 240;
const ARC_SWEEP_RAD = (ARC_SWEEP_DEG * Math.PI) / 180;
const ARC_LENGTH = ARC_RADIUS * ARC_SWEEP_RAD;

const GLOW_DELAY = 130;

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
    progress: number;
    color: string;
    finished: boolean;
    breathingPhase?: SharedValue<number>;
};

export const PhaseArc = ({
    progress,
    color,
    finished,
    breathingPhase,
}: PhaseArcProps) => {
    const { theme } = useTheme();
    const trackColor = theme.palette.background.card;
    // const trackColor = theme.palette.accent.soft;

    const cx = ARC_SIZE / 2;
    const cy = ARC_SIZE / 2;

    const startAngle = -120;
    const endAngle = 120;
    const arcPath = describeArc(cx, cy, ARC_RADIUS, startAngle, endAngle);

    // Main arc progress – follows the real phase progress
    const mainProgress = useSharedValue(
        Math.max(0, Math.min(1, progress ?? 0))
    );

    // Glow sweep progress (0..1 along the arc) and opacity
    const glowProgress = useSharedValue(0);
    const glowOpacity = useSharedValue(0);

    const prevFinished = useRef(false);

    // Normal phase progress (JS thread)
    useEffect(() => {
        cancelAnimation(mainProgress);

        const clamped = Math.max(0, Math.min(1, progress ?? 0));
        mainProgress.value = withTiming(clamped, {
            duration: 200, // to follow 5 Hz tick
            easing: Easing.linear,
        });
    }, [progress, mainProgress]);

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
                        duration: 200,
                        easing: Easing.out(Easing.cubic),
                    }),
                    withTiming(0, {
                        duration: 400,
                        easing: Easing.in(Easing.cubic),
                    })
                )
            );

            glowProgress.value = withDelay(
                GLOW_DELAY,
                withTiming(1, {
                    duration: 700,
                    easing: Easing.inOut(Easing.cubic),
                })
            );
        }

        prevFinished.current = finished;
    }, [finished, glowProgress, glowOpacity]);

    const mainProps = useAnimatedProps(() => {
        // Raw arc progress coming from shared value
        const rawMainProgress = mainProgress.value;

        // Clamp between 0 and 1 so the strokeDashoffset stays valid
        const clampedMainProgress =
            rawMainProgress < 0 ? 0 : rawMainProgress > 1 ? 1 : rawMainProgress;

        // Convert progress → stroke offset
        const strokeDashoffset = ARC_LENGTH * (1 - clampedMainProgress);

        return { strokeDashoffset };
    });

    const glowProps = useAnimatedProps(() => {
        const rawGlowProgress = glowProgress.value;

        const clampedGlowProgress =
            rawGlowProgress < 0 ? 0 : rawGlowProgress > 1 ? 1 : rawGlowProgress;

        const strokeDashoffset = ARC_LENGTH * (1 - clampedGlowProgress);

        return {
            strokeDashoffset,
            opacity: glowOpacity.value * 0.9,
        };
    });

    const breathingProps = useAnimatedProps(() => {
        // Main arc progress for the halo ring
        const rawMainProgress = mainProgress.value;

        const clampedMainProgress =
            rawMainProgress < 0 ? 0 : rawMainProgress > 1 ? 1 : rawMainProgress;

        const strokeDashoffset = ARC_LENGTH * (1 - clampedMainProgress);

        // Breathing animation modifier
        const rawBreathValue = breathingPhase ? breathingPhase.value : 0;

        const clampedBreathValue =
            rawBreathValue < 0 ? 0 : rawBreathValue > 1 ? 1 : rawBreathValue;

        return {
            strokeDashoffset,
            opacity: clampedBreathValue * 0.6,
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
                strokeWidth={ARC_STROKE + 6}
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
