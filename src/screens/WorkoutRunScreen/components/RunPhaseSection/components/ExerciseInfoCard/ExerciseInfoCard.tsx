import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import type { Phase } from '@src/core/timer';
import useExerciseInfoCardStyles from './ExerciseInfoCard.styles';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

type ExerciseInfoCardProps = {
    phase: Phase;
    color: string;
    currentExerciseName: string;
};

const NAME_OUT_DURATION = 150;
const NAME_IN_DURATION = 180;

export const ExerciseInfoCard = ({
    phase,
    color,
    currentExerciseName,
}: ExerciseInfoCardProps) => {
    const st = useExerciseInfoCardStyles();
    const { theme } = useTheme();

    // Name being shown
    const [displayedName, setDisplayedName] = useState(currentExerciseName);

    // Card dimming when completed
    const cardOpacity = useSharedValue(1);

    // Name animation
    const nameOpacity = useSharedValue(1);
    const nameTranslateY = useSharedValue(0);

    const nameAnimatedStyle = useAnimatedStyle(() => ({
        opacity: nameOpacity.value,
        transform: [{ translateY: nameTranslateY.value }],
    }));

    // Tick animation
    const tickScale = useSharedValue(0);
    const tickOpacity = useSharedValue(0);

    const tickAnimatedStyle = useAnimatedStyle(() => ({
        opacity: tickOpacity.value,
        transform: [{ scale: tickScale.value }],
    }));

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
    }));

    // Track last phase to detect WORK → REST/PREP
    const lastPhaseRef = useRef<Phase | null>(null);

    // --- Name change animation (slide/fade out → swap → slide/fade in) ---
    useEffect(() => {
        if (currentExerciseName === displayedName) return;

        // Kill any pending animations for the name before starting a new cycle
        cancelAnimation(nameTranslateY);
        cancelAnimation(nameOpacity);

        // OUT
        nameTranslateY.value = withTiming(-8, {
            duration: NAME_OUT_DURATION,
            easing: Easing.out(Easing.ease),
        });
        nameOpacity.value = withTiming(0, {
            duration: NAME_OUT_DURATION,
            easing: Easing.out(Easing.ease),
        });

        const timeoutId = setTimeout(() => {
            // swap text
            setDisplayedName(currentExerciseName);

            // reset under and invisible
            nameTranslateY.value = 8;
            nameOpacity.value = 0;

            // IN
            nameTranslateY.value = withTiming(0, {
                duration: NAME_IN_DURATION,
                easing: Easing.out(Easing.ease),
            });
            nameOpacity.value = withTiming(1, {
                duration: NAME_IN_DURATION,
                easing: Easing.out(Easing.ease),
            });
        }, NAME_OUT_DURATION);

        return () => {
            clearTimeout(timeoutId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentExerciseName, displayedName]);

    // Reset completion visuals whenever we start a *new* exercise
    useEffect(() => {
        // Stop any previous completion animation for the old exercise
        cancelAnimation(cardOpacity);
        cancelAnimation(tickScale);
        cancelAnimation(tickOpacity);

        cardOpacity.value = 1;
        tickScale.value = 0;
        tickOpacity.value = 0;
    }, [currentExerciseName, cardOpacity, tickOpacity, tickScale]);

    // --- Completion logic based on phase transitions ---
    useEffect(() => {
        const last = lastPhaseRef.current;

        // WORK -> not WORK => mark as completed
        if (last === 'WORK' && phase !== 'WORK' && currentExerciseName) {
            // Avoid overlapping fades
            cancelAnimation(cardOpacity);
            cancelAnimation(tickScale);
            cancelAnimation(tickOpacity);

            cardOpacity.value = withTiming(0.5, { duration: 220 });

            tickOpacity.value = withTiming(1, { duration: 180 });
            tickScale.value = withTiming(1, {
                duration: 180,
                easing: Easing.out(Easing.ease),
            });
        }

        // When going back to WORK, ensure the card is "active" again
        if (phase === 'WORK') {
            cancelAnimation(cardOpacity);
            cancelAnimation(tickScale);
            cancelAnimation(tickOpacity);

            cardOpacity.value = 1;
            tickScale.value = 0;
            tickOpacity.value = 0;
        }

        lastPhaseRef.current = phase;
    }, [phase, currentExerciseName, cardOpacity, tickOpacity, tickScale]);

    return (
        <Animated.View
            style={[st.currentCard, cardAnimatedStyle, { borderColor: color }]}
        >
            <View style={st.currentHeaderRow}>
                <AppText variant="caption" style={st.currentTitle}>
                    Exercise
                </AppText>
            </View>

            <View style={st.currentBodyRow}>
                <Animated.View style={nameAnimatedStyle}>
                    <AppText
                        variant="title2"
                        style={st.currentName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {displayedName}
                    </AppText>
                </Animated.View>

                <Animated.View
                    style={[
                        st.checkCircle,
                        { backgroundColor: color },
                        tickAnimatedStyle,
                    ]}
                >
                    <Ionicons
                        name="checkmark"
                        size={14}
                        color={theme.palette.text.primary}
                    />
                </Animated.View>
            </View>
        </Animated.View>
    );
};
