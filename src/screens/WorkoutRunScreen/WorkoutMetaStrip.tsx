import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import st from './styles';

type WorkoutMetaStripProps = {
    blockIndex: number; // 0-based
    blockTitle?: string | null;
    currentSetIndex: number; // 0-based
    totalSets: number;
    remainingWorkoutSec: number;
    setProgress: number; // 0..1 (continuous progress inside current set)
    phaseColor: string;
};

const formatDuration = (sec: number): string => {
    const total = Math.max(0, Math.floor(sec));
    const m = Math.floor(total / 60);
    const s = total % 60;
    const sStr = s.toString().padStart(2, '0');
    return m > 0 ? `${m}:${sStr}` : `${s}s`;
};

export const WorkoutMetaStrip = ({
    blockIndex,
    blockTitle,
    currentSetIndex,
    totalSets,
    remainingWorkoutSec,
    setProgress,
    phaseColor,
}: WorkoutMetaStripProps) => {
    const displayBlockLabel =
        blockTitle && blockTitle.trim().length > 0
            ? blockTitle.trim()
            : `Block ${blockIndex + 1}`;

    const currentSet = currentSetIndex + 1;
    const safeTotalSets = totalSets || 1;

    // ---- animated visual progress for *current* set pill ----
    const visualProgress = useSharedValue(
        Math.min(1, Math.max(0, setProgress ?? 0))
    );

    const lastSetIndexRef = useRef(currentSetIndex);

    useEffect(() => {
        const target = Math.min(1, Math.max(0, setProgress ?? 0));

        // If we just moved to a new set, snap to the new progress (usually 0)
        if (lastSetIndexRef.current !== currentSetIndex) {
            visualProgress.value = target;
            lastSetIndexRef.current = currentSetIndex;
            return;
        }

        // Same set: animate smoothly
        visualProgress.value = Math.min(Math.max(setProgress, 0), 1);
    }, [setProgress, currentSetIndex, visualProgress]);

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
            {/* Top row: Block | Time remaining | Set x/y */}
            <View style={st.metaStripTopRow}>
                <View style={st.metaStripTopLeft}>
                    <Text style={st.metaStripBlockText}>
                        {displayBlockLabel}
                    </Text>
                </View>

                <View style={st.metaStripTopCenter}>
                    <Text style={st.metaStripTimeText}>
                        {formatDuration(remainingWorkoutSec)} left
                    </Text>
                </View>

                <View style={st.metaStripTopRight}>
                    <Text style={st.metaStripSetText}>
                        Set {currentSet}/{safeTotalSets}
                    </Text>
                </View>
            </View>

            {/* Bottom row: pills per set */}
            <View style={st.metaStripPillsRow}>
                {pills.map((i) => {
                    const isPast = i < currentSetIndex;
                    const isCurrent = i === currentSetIndex;

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
        </View>
    );
};
