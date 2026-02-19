import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
    cancelAnimation,
} from 'react-native-reanimated';

import type { Phase } from '@src/core/timer';
import useNextExerciseCarouselStyles from './NextExerciseCarousel.styles';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTranslation } from 'react-i18next';

const OUT_DURATION = 150;
const IN_DURATION = 180;
const OPACITY_DELAY = 220;
const DIM_DELAY = 100;

type NextExerciseCarouselProps = {
    phase: Phase;
    label: string;
};

export const NextExerciseCarousel: React.FC<NextExerciseCarouselProps> = ({
    label,
    phase,
}) => {
    const { t } = useTranslation();
    const st = useNextExerciseCarouselStyles();

    const [displayed, setDisplayed] = useState(label);

    // text animation
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    // card overall opacity (dim vs highlight)
    const cardOpacity = useSharedValue(0.5);
    const cardAnimatedStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
    }));

    const lastPhaseRef = useRef<Phase | null>(null);

    // ----- label change → slide/fade out, swap, slide/fade in -----
    useEffect(() => {
        if (label === displayed) return;

        // Stop any running text animation before starting a new one
        cancelAnimation(translateY);
        cancelAnimation(opacity);

        // OUT
        translateY.value = withTiming(-8, {
            duration: OUT_DURATION,
            easing: Easing.out(Easing.ease),
        });
        opacity.value = withTiming(0, {
            duration: OUT_DURATION,
            easing: Easing.out(Easing.ease),
        });

        const timeoutId = setTimeout(() => {
            setDisplayed(label);

            // reset below and hidden
            translateY.value = 8;
            opacity.value = 0;

            // IN
            translateY.value = withTiming(0, {
                duration: IN_DURATION,
                easing: Easing.out(Easing.ease),
            });
            opacity.value = withTiming(1, {
                duration: IN_DURATION,
                easing: Easing.out(Easing.ease),
            });
        }, OUT_DURATION);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [label, displayed]);

    // ----- phase → dim / highlight card -----
    useEffect(() => {
        const last = lastPhaseRef.current;

        // Stop any pending opacity animation before scheduling a new one
        cancelAnimation(cardOpacity);

        // WORK -> REST → fade card in (highlight "Next" during rest)
        if (last === 'WORK' && phase === 'REST') {
            cardOpacity.value = withDelay(
                OPACITY_DELAY,
                withTiming(1, { duration: 220 })
            );
        }

        // leaving REST → dim again
        if (phase !== 'REST') {
            cardOpacity.value = withDelay(
                DIM_DELAY,
                withTiming(0.5, { duration: 180 })
            );
        }

        lastPhaseRef.current = phase;
    }, [phase, cardOpacity]);

    if (!displayed) return null;

    return (
        <Animated.View style={[st.nextCardWrapper, cardAnimatedStyle]}>
            <View style={st.nextCard}>
                <AppText variant="captionSmall" style={st.nextTitle}>
                    {t('run.section.next')}
                </AppText>

                <Animated.View style={textAnimatedStyle}>
                    <AppText
                        variant="bodySmall"
                        style={st.nextText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {displayed}
                    </AppText>
                </Animated.View>
            </View>
        </Animated.View>
    );
};
