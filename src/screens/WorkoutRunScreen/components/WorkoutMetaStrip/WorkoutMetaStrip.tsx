import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { AppText } from '@src/components/ui/Typography/AppText';
import useWorkoutMetaStripStyles from './WorkoutMetaStrip.styles';

type WorkoutMetaStripProps = {
    blockIndex: number; // 0-based
    blockTitle?: string | null;
    currentSetIndex: number; // 0-based (from engine)
    totalSets: number;
    setProgress: number; // 0..1 (continuous progress inside current set)
    phaseColor: string;
};

const clampProgress = (p: number | null | undefined): number =>
    Math.min(1, Math.max(0, p ?? 0));

export const WorkoutMetaStrip = ({
    blockIndex,
    blockTitle,
    currentSetIndex,
    totalSets,
    setProgress,
    phaseColor,
}: WorkoutMetaStripProps) => {
    const st = useWorkoutMetaStripStyles();

    const displayBlockLabel =
        blockTitle && blockTitle.trim().length > 0
            ? blockTitle.trim()
            : `Block ${blockIndex + 1}`;

    const currentSet = currentSetIndex + 1;
    const safeTotalSets = totalSets || 1;

    // "Visual" set index that controls which pill is current.
    // We only switch this after resetting its progress to 0.
    const [animatingSet, setAnimatingSet] = useState(currentSetIndex);

    // Animated progress for the current visual set
    const visualProgress = useSharedValue(clampProgress(setProgress));

    useEffect(() => {
        const clamped = clampProgress(setProgress);

        // --- set transition ---
        if (currentSetIndex !== animatingSet) {
            visualProgress.value = 0;
            setAnimatingSet(currentSetIndex);
            return;
        }

        // --- normal within-set animation ---
        visualProgress.value = withTiming(clamped, {
            duration: 200, // matches 5 Hz tick
            easing: Easing.linear,
        });
    }, [setProgress, currentSetIndex, animatingSet, visualProgress]);

    const currentFillStyle = useAnimatedStyle(() => ({
        flex: visualProgress.value,
    }));

    const currentRemainderStyle = useAnimatedStyle(() => ({
        flex: 1 - visualProgress.value,
    }));

    const pills = Array.from(
        { length: Math.max(safeTotalSets, 1) },
        (_, i) => i
    );

    return (
        <View style={st.metaStripContainer}>
            {/* Bottom row: pills per set */}
            <View style={st.metaStripPillsRow}>
                {pills.map((i) => {
                    const isPast = i < animatingSet;
                    const isCurrent = i === animatingSet;

                    if (isPast) {
                        return (
                            <View key={i} style={st.metaStripPillOuter}>
                                <View
                                    style={[
                                        st.metaStripPillFill,
                                        {
                                            flex: 1,
                                            backgroundColor: phaseColor,
                                        },
                                    ]}
                                />
                            </View>
                        );
                    }

                    if (isCurrent) {
                        return (
                            <View key={i} style={st.metaStripPillOuter}>
                                <Animated.View
                                    style={[
                                        st.metaStripPillFill,
                                        { backgroundColor: phaseColor },
                                        currentFillStyle,
                                    ]}
                                />
                                <Animated.View
                                    style={[
                                        st.metaStripPillRemainder,
                                        currentRemainderStyle,
                                    ]}
                                />
                            </View>
                        );
                    }

                    return (
                        <View key={i} style={st.metaStripPillOuter}>
                            <View style={st.metaStripPillRemainder} />
                        </View>
                    );
                })}
            </View>

            {/* Top row: block label + set indicator */}
            <View style={st.metaStripTopRow}>
                <View style={st.metaStripTopLeft}>
                    <AppText
                        variant="bodySmall"
                        style={st.metaStripBlockText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {displayBlockLabel}
                    </AppText>
                </View>

                <View style={st.metaStripTopRight}>
                    <AppText variant="bodySmall" style={st.metaStripSetText}>
                        Set {currentSet} of {safeTotalSets}
                    </AppText>
                </View>
            </View>
        </View>
    );
};

export default WorkoutMetaStrip;
