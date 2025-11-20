import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

import type { Phase } from '@core/timer';
import st from './styles';

type ExerciseInfoCardProps = {
    phase: Phase;
    color: string;
    currentExerciseName: string;
};

export const ExerciseInfoCard = ({
    phase,
    color,
    currentExerciseName,
}: ExerciseInfoCardProps) => {
    // 1) Card-level opacity used when we "complete" the exercise
    const cardOpacity = useRef(new Animated.Value(1)).current;

    // 2) Tick animation (scale + opacity)
    const tickScale = useRef(new Animated.Value(0)).current;
    const tickOpacity = useRef(new Animated.Value(0)).current;

    // 3) Text carousel animation (independent from completion)
    const [displayedName, setDisplayedName] =
        useState<string>(currentExerciseName);
    const nameOpacity = useRef(new Animated.Value(1)).current;
    const nameTranslateY = useRef(new Animated.Value(0)).current;

    // Track last phase to detect WORK → REST/PREP
    const lastPhaseRef = useRef<Phase | null>(null);

    // When exercise name changes -> slide/fade text like a carousel
    useEffect(() => {
        if (currentExerciseName === displayedName) return;

        // slide + fade out
        Animated.parallel([
            Animated.timing(nameTranslateY, {
                toValue: -8,
                duration: 150,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(nameOpacity, {
                toValue: 0,
                duration: 150,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            // swap text
            setDisplayedName(currentExerciseName);

            // reset position below and 0 opacity
            nameTranslateY.setValue(8);
            nameOpacity.setValue(0);

            // slide + fade in
            Animated.parallel([
                Animated.timing(nameTranslateY, {
                    toValue: 0,
                    duration: 180,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(nameOpacity, {
                    toValue: 1,
                    duration: 180,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        });
    }, [currentExerciseName, displayedName, nameOpacity, nameTranslateY]);

    // Reset completion visuals whenever we start a *new* exercise
    useEffect(() => {
        cardOpacity.setValue(1);
        tickScale.setValue(0);
        tickOpacity.setValue(0);
    }, [currentExerciseName, cardOpacity, tickScale, tickOpacity]);

    // Completion logic based on phase transitions
    useEffect(() => {
        const last = lastPhaseRef.current;

        // WORK -> not WORK => mark as completed
        if (last === 'WORK' && phase !== 'WORK' && currentExerciseName) {
            Animated.timing(cardOpacity, {
                toValue: 0.5,
                duration: 220,
                useNativeDriver: true,
            }).start(() => {
                Animated.parallel([
                    Animated.timing(tickOpacity, {
                        toValue: 1,
                        duration: 180,
                        useNativeDriver: true,
                    }),
                    Animated.spring(tickScale, {
                        toValue: 1,
                        friction: 6,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }

        // When going back to WORK, ensure the card is "active" again
        if (phase === 'WORK') {
            cardOpacity.setValue(1);
            tickScale.setValue(0);
            tickOpacity.setValue(0);
        }

        lastPhaseRef.current = phase;
    }, [phase, currentExerciseName, cardOpacity, tickOpacity, tickScale]);

    return (
        <Animated.View
            style={[
                st.currentCard,
                { borderColor: color, opacity: cardOpacity },
            ]}
        >
            <View style={st.currentHeaderRow}>
                <Text style={st.currentTitle}>Exercise</Text>
            </View>

            <View style={st.currentBodyRow}>
                <Animated.Text
                    style={[
                        st.currentName,
                        {
                            opacity: nameOpacity,
                            transform: [{ translateY: nameTranslateY }],
                        },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {displayedName}
                </Animated.Text>

                <Animated.View
                    style={[
                        st.checkCircle,
                        {
                            backgroundColor: color,
                            opacity: tickOpacity,
                            transform: [{ scale: tickScale }],
                        },
                    ]}
                >
                    <Text style={st.checkMark}>✓</Text>
                </Animated.View>
            </View>
        </Animated.View>
    );
};
