import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    cancelAnimation,
} from 'react-native-reanimated';

import useWorkoutMetaStripStyles from './SetProgressPills.styles';

type SetProgressPillsProps = {
    currentSetIndex: number; // 0-based (from engine)
    totalSets: number;
    setProgress: number; // 0..1 (continuous progress inside current set)
    phaseColor: string;
};

const clampProgress = (p: number | null | undefined): number =>
    Math.min(1, Math.max(0, p ?? 0));

export const SetProgressPills = ({
    currentSetIndex,
    totalSets,
    setProgress,
    phaseColor,
}: SetProgressPillsProps) => {
    const st = useWorkoutMetaStripStyles();

    const safeTotalSets = totalSets || 1;

    // "Visual" set index that controls which pill is current.
    // We only switch this after resetting its progress to 0.
    const [animatingSet, setAnimatingSet] = useState(currentSetIndex);

    // Animated progress for the current visual set
    const visualProgress = useSharedValue(clampProgress(setProgress));

    useEffect(() => {
        const clamped = clampProgress(setProgress);

        // --- set transition guard ---
        if (currentSetIndex !== animatingSet) {
            // Kill any running animation from the old set
            cancelAnimation(visualProgress);

            // Snap to 0 for the *new* set
            visualProgress.value = 0;

            // Only after the snap, update which pill is "current"
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
    );
};

export default SetProgressPills;
