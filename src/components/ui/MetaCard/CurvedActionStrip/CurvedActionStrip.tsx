import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@src/theme/ThemeProvider';
import { useCurvedActionStripStyles } from './CurvedActionStrip.styles';

const BASE_WIDTH = 50;
const BASE_HEIGHT = 60;

const buildStripPath = (scale: number): string => {
    const rx = 160 * scale;
    const ry = 140 * scale;

    const x2 = 50 * scale;
    const y2 = 60 * scale;

    const x3 = 50 * scale;
    const y3 = 0 * scale;

    return `M 0 0 A ${rx} ${ry} 0 0 1 ${x2} ${y2} L ${x3} ${y3} L 0 0 Z`;
};

type CurvedActionStripProps = {
    onPress?: () => void;
    icon?: ReactNode;
    backgroundColorOverride?: string;
    width?: number; // optional: resize strip while keeping shape
};

export const CurvedActionStrip = ({
    onPress,
    icon,
    backgroundColorOverride,
    width = BASE_WIDTH,
}: CurvedActionStripProps) => {
    const { theme } = useTheme();
    const st = useCurvedActionStripStyles();

    const scale = width / BASE_WIDTH;
    const height = BASE_HEIGHT * scale;
    const pathD = buildStripPath(scale);

    const fill =
        backgroundColorOverride ??
        theme.palette.metaCard.actionStrip.background;

    return (
        <Pressable onPress={onPress} style={st.touchArea} hitSlop={8}>
            <Svg width={width} height={height} style={st.svg}>
                <Path d={pathD} fill={fill} />
            </Svg>

            {/* Icon overlay */}
            <View style={st.iconContainer}>
                {React.isValidElement(icon) ? icon : null}
            </View>
        </Pressable>
    );
};
