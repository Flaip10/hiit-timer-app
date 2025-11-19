// src/screens/workouts/PhaseArc.tsx
import React, { useEffect, useRef } from 'react';
import Svg, { Path } from 'react-native-svg';
import Reanimated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withSequence,
    withDelay,
    Easing,
} from 'react-native-reanimated';

import { ARC_SIZE } from './styles';

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
    /** 0..1 progress inside the current phase */
    progress: number;
    color: string;
    /** true when the whole workout is finished */
    finished: boolean;
};

export const PhaseArc = ({ progress, color, finished }: PhaseArcProps) => {
    const cx = ARC_SIZE / 2;
    const cy = ARC_SIZE / 2;

    const startAngle = -120;
    const endAngle = 120;
    const arcPath = describeArc(cx, cy, ARC_RADIUS, startAngle, endAngle);

    // Main arc progress – follows the real phase progress
    const mainProgress = useSharedValue(progress);

    // Glow sweep progress (0..1 along the arc) and opacity
    const glowProgress = useSharedValue(0);
    const glowOpacity = useSharedValue(0);

    const prevFinished = useRef(false);

    // Normal phase progress
    useEffect(() => {
        const clamped = Math.min(Math.max(progress, 0), 1);
        mainProgress.value = withTiming(clamped, {
            duration: clamped === 0 ? 250 : 1000,
            easing: Easing.linear,
        });
    }, [progress, mainProgress]);

    // One-shot glow sweep when we enter "finished"
    useEffect(() => {
        const wasFinished = prevFinished.current;

        if (!wasFinished && finished) {
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
        const clamped = Math.min(Math.max(mainProgress.value, 0), 1);
        const strokeDashoffset = ARC_LENGTH * (1 - clamped);

        return { strokeDashoffset };
    });

    const glowProps = useAnimatedProps(() => {
        const clamped = Math.min(Math.max(glowProgress.value, 0), 1);
        const strokeDashoffset = ARC_LENGTH * (1 - clamped);

        return {
            strokeDashoffset,
            opacity: glowOpacity.value * 0.9,
        };
    });

    return (
        <Svg
            width={ARC_SIZE + SVG_PADDING * 2}
            height={ARC_SIZE + SVG_PADDING * 2}
            viewBox={`${-SVG_PADDING} ${-SVG_PADDING} ${ARC_SIZE + SVG_PADDING * 2} ${ARC_SIZE + SVG_PADDING * 2}`}
        >
            {/* Background track */}
            <Path
                d={arcPath}
                stroke="#111827"
                strokeWidth={ARC_STROKE}
                fill="transparent"
                strokeLinecap="round"
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
