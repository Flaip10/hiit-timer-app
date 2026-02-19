import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import type { WorkoutBlock } from '@src/core/entities/entities';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useWorkoutBlockItemStyles } from './WorkoutBlockItem.styles';
import { useTranslation } from 'react-i18next';

type WorkoutBlockItemProps = {
    index: number;
    block: WorkoutBlock;
    onPress?: (id: string) => void;
    onRemove?: (id: string) => void;
    expanded?: boolean;
    initiallyExpanded?: boolean;

    isWiggling?: boolean;
};

const SHAKE_DISTANCE = 1;
const SHAKE_STEP_MS = 300;
const PAUSE_BETWEEN_SHAKES_MS = 500;
const INITIAL_DELAY_STAGGER_MS = 90;

export const WorkoutBlockItem = ({
    index,
    block,
    onPress,
    onRemove,
    expanded = false,
    initiallyExpanded = false,
    isWiggling = false,
}: WorkoutBlockItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useWorkoutBlockItemStyles();
    const { sets, exercises } = block;

    const wiggleValue = useSharedValue<number>(0);

    const wiggleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: wiggleValue.value }],
    }));

    useEffect(() => {
        if (!isWiggling) {
            cancelAnimation(wiggleValue);
            wiggleValue.value = 0;
            return;
        }

        const initialDelayMs = index * INITIAL_DELAY_STAGGER_MS;
        const easing = Easing.inOut(Easing.quad);

        wiggleValue.value = withDelay(
            initialDelayMs,
            withRepeat(
                withSequence(
                    withTiming(SHAKE_DISTANCE, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withTiming(-SHAKE_DISTANCE, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withTiming(SHAKE_DISTANCE, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withTiming(0, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withDelay(
                        PAUSE_BETWEEN_SHAKES_MS,
                        withTiming(0, {
                            duration: 0,
                            easing,
                        })
                    )
                ),
                -1
            )
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, isWiggling]);

    const exerciseSummary = useMemo(() => {
        if (exercises.length === 0) return '';

        const first = exercises[0];
        const allSame = exercises.every(
            (ex) => ex.mode === first.mode && ex.value === first.value
        );

        if (!allSame) return '';
        return first.mode === 'time'
            ? t('workoutBlockItem.summary.timeEach', { value: first.value })
            : t('workoutBlockItem.summary.repsEach', { value: first.value });
    }, [exercises, t]);

    const metaParts = useMemo(() => {
        const parts: string[] = [
            t('common.units.set', { count: sets }),
            t('common.units.exercise', { count: exercises.length }),
        ];
        if (exerciseSummary) parts.push(exerciseSummary);
        return parts;
    }, [sets, exercises.length, exerciseSummary, t]);

    const trimmedTitle = block.title?.trim();
    const blockLabel =
        trimmedTitle && trimmedTitle.length > 0
            ? trimmedTitle
            : t('common.labels.blockWithIndex', { index: index + 1 });

    const formatExerciseMeta = (
        mode: WorkoutBlock['exercises'][number]['mode'],
        value: number,
        restSec?: number
    ): string => {
        const main =
            mode === 'time'
                ? t('workoutBlockItem.exerciseMeta.time', { value })
                : t(
                      value === 1
                          ? 'workoutBlockItem.exerciseMeta.reps_one'
                          : 'workoutBlockItem.exerciseMeta.reps_other',
                      { count: value }
                  );
        return restSec && restSec > 0
            ? `${main} • ${t('workoutBlockItem.exerciseMeta.rest', { value: restSec })}`
            : main;
    };

    const handlePress = onPress ? () => onPress(block.id) : undefined;

    const actionStrip = onRemove
        ? {
              icon: (
                  <Ionicons
                      name="trash-outline"
                      size={18}
                      color={theme.palette.metaCard.actionStrip.icon}
                  />
              ),
              backgroundColor: theme.palette.metaCard.actionStrip.background,
              onPress: () => onRemove(block.id),
          }
        : undefined;

    const measureKey = [
        block.id,
        block.sets,
        block.exercises.length,
        block.restBetweenSetsSec,
        block.restBetweenExercisesSec,
    ].join(':');

    return (
        <Animated.View style={isWiggling ? wiggleAnimatedStyle : undefined}>
            <MetaCard
                measureKey={measureKey}
                topLeftContent={{
                    text: blockLabel,
                    icon: (
                        <Ionicons
                            name="layers-outline"
                            size={14}
                            color={theme.palette.metaCard.topLeftContent.text}
                        />
                    ),
                    backgroundColor:
                        theme.palette.metaCard.topLeftContent.background,
                    color: theme.palette.metaCard.topLeftContent.text,
                    borderColor: theme.palette.metaCard.topLeftContent.border,
                }}
                actionStrip={actionStrip}
                expandable={!expanded}
                initiallyExpanded={initiallyExpanded}
                withBottomFade={false}
                minHeight={0}
                onPress={handlePress}
                summaryContent={
                    <View style={st.body}>
                        <View style={st.blockInfoRow}>
                            <Ionicons
                                name="timer-outline"
                                size={14}
                                color={theme.palette.text.secondary}
                            />
                            <AppText variant="bodySmall" tone="secondary">
                                {metaParts.join(' • ')}
                            </AppText>
                        </View>
                    </View>
                }
                collapsibleContent={
                    <View style={st.body}>
                        <View style={st.exercisesContainer}>
                            {exercises.map((ex, i) => (
                                <View key={ex.id} style={st.exerciseRow}>
                                    <View style={st.exerciseIndexBubble}>
                                        <AppText
                                            variant="caption"
                                            style={st.exerciseIndexText}
                                        >
                                            {i + 1}
                                        </AppText>
                                    </View>

                                    <View style={st.exerciseTexts}>
                                        <AppText
                                            variant="bodySmall"
                                            tone="primary"
                                            numberOfLines={1}
                                        >
                                            {ex.name ??
                                                t(
                                                    'workoutBlockItem.labels.exerciseWithIndex',
                                                    {
                                                        index: i + 1,
                                                    }
                                                )}
                                        </AppText>

                                        <AppText
                                            variant="caption"
                                            tone="muted"
                                            numberOfLines={1}
                                        >
                                            {formatExerciseMeta(
                                                ex.mode,
                                                ex.value
                                            )}
                                        </AppText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                }
            />
        </Animated.View>
    );
};
