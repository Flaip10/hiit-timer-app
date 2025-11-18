import React, { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import Reanimated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing as ReEasing,
} from 'react-native-reanimated';

import { ARC_SIZE } from './styles';

const AnimatedPath = Reanimated.createAnimatedComponent(Path);

const ARC_STROKE = 17;
const ARC_RADIUS = (ARC_SIZE - ARC_STROKE) / 2;

// 240° arc, open at the bottom like a rainbow
const ARC_SWEEP_DEG = 240;
const ARC_SWEEP_RAD = (ARC_SWEEP_DEG * Math.PI) / 180;
const ARC_LENGTH = ARC_RADIUS * ARC_SWEEP_RAD;

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

    return [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`,
    ].join(' ');
};

type PhaseArcProps = {
    progress: number; // 0..1
    color: string;
};

export const PhaseArc = ({ progress, color }: PhaseArcProps) => {
    const cx = ARC_SIZE / 2;
    const cy = ARC_SIZE / 2;

    const startAngle = -120;
    const endAngle = 120;
    const arcPath = describeArc(cx, cy, ARC_RADIUS, startAngle, endAngle);

    const animatedProgress = useSharedValue(progress);

    useEffect(() => {
        const clamped = Math.min(Math.max(progress, 0), 1);
        animatedProgress.value = withTiming(clamped, {
            duration: 300,
            easing: ReEasing.out(ReEasing.cubic),
        });
    }, [progress, animatedProgress]);

    const animatedProps = useAnimatedProps(() => {
        const clamped = Math.min(Math.max(animatedProgress.value, 0), 1);
        const strokeDashoffset = ARC_LENGTH * (1 - clamped);

        return { strokeDashoffset };
    });

    return (
        <Svg width={ARC_SIZE} height={ARC_SIZE}>
            <Path
                d={arcPath}
                stroke="#111827"
                strokeWidth={ARC_STROKE}
                fill="transparent"
                strokeLinecap="round"
            />
            <AnimatedPath
                d={arcPath}
                stroke={color}
                strokeWidth={ARC_STROKE}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
                animatedProps={animatedProps}
            />
        </Svg>
    );
};
