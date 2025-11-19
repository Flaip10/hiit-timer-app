import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import st from './styles';
import { Phase } from '@src/core/timer';

const OPACITY_DELAY = 220;

type NextExerciseCarouselProps = {
    phase: Phase;
    label: string;
};

export const NextExerciseCarousel = ({
    label,
    phase,
}: NextExerciseCarouselProps) => {
    const [displayed, setDisplayed] = useState(label);
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const cardOpacity = useRef(new Animated.Value(0.5)).current;

    const lastPhaseRef = useRef<Phase | null>(null);

    useEffect(() => {
        if (label === displayed) return;

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -8,
                duration: 150,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 150,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setDisplayed(label);
            translateY.setValue(8);
            opacity.setValue(0);

            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 180,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        });
    }, [label, displayed, opacity, translateY]);

    useEffect(() => {
        const last = lastPhaseRef.current;

        if (last === 'WORK' && phase === 'REST') {
            Animated.sequence([
                Animated.delay(OPACITY_DELAY),
                Animated.timing(cardOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        if (phase !== 'REST') {
            Animated.sequence([
                Animated.delay(100),
                Animated.timing(cardOpacity, {
                    toValue: 0.5,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        lastPhaseRef.current = phase;
    }, [phase, cardOpacity]);

    if (!displayed) return null;

    return (
        <Animated.View style={[st.nextCardWrapper, { opacity: cardOpacity }]}>
            <View style={st.nextCard}>
                <Text style={st.nextTitle}>Next</Text>
                <Animated.Text
                    style={[
                        st.nextText,
                        {
                            opacity,
                            transform: [{ translateY }],
                        },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {displayed}
                </Animated.Text>
            </View>
        </Animated.View>
    );
};
