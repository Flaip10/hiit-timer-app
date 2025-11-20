import React, { useEffect, useRef } from 'react';
import { Animated, Text, ViewStyle } from 'react-native';
import st from './FinishedCard.styles';

type FinishedCardProps = {
    visible: boolean;
};

export const FinishedCard = ({ visible }: FinishedCardProps) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 260,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 260,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            opacity.setValue(0);
            translateY.setValue(12);
        }
    }, [visible, opacity, translateY]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                st.finishedCard as ViewStyle,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <Text style={st.finishedTitle}>Workout complete 🎉</Text>
            <Text style={st.finishedBody}>
                Nice work. You&apos;ve finished all steps in this workout.
            </Text>
        </Animated.View>
    );
};
