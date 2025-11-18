import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import st from './styles';

type NextExerciseCarouselProps = {
    label: string;
};

export const NextExerciseCarousel = ({ label }: NextExerciseCarouselProps) => {
    const [displayed, setDisplayed] = useState(label);
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

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

    if (!displayed) return null;

    return (
        <View style={st.nextCardWrapper}>
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
        </View>
    );
};
