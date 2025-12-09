import React, { RefObject, useMemo } from 'react';
import { View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import type { Workout } from '@core/entities';
import {
    summarizeWorkout,
    formatWorkoutDuration,
} from '@core/workouts/summarizeWorkout';

import { AppText } from '@src/components/ui/Typography/AppText';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { useTheme } from '@src/theme/ThemeProvider';
import { useShareWorkoutCardStyles } from './ShareWorkoutCard.styles';

type ShareWorkoutCardProps = {
    workout: Workout;
    phaseColor: string;
    shareRef: RefObject<View | null>;
};

const buildCompletedLabel = (): string => {
    const now = new Date();

    const datePart = now.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const timePart = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${datePart} • ${timePart}`;
};

export const ShareWorkoutCard = ({
    workout,
    phaseColor,
    shareRef,
}: ShareWorkoutCardProps) => {
    const { theme } = useTheme();
    const st = useShareWorkoutCardStyles();

    const summary = useMemo(() => summarizeWorkout(workout), [workout]);

    const timeLabel =
        summary.approxSec > 0
            ? formatWorkoutDuration(summary.approxSec)
            : summary.hasReps
              ? 'Mixed (time + reps)'
              : 'No time estimate';

    const completedLabel = useMemo(buildCompletedLabel, []);

    const blocksForCard = useMemo(
        () =>
            workout.blocks.map((block, index) => {
                const title =
                    block.title && block.title.trim().length > 0
                        ? block.title.trim()
                        : `Block ${index + 1}`;

                const exerciseNames = block.exercises.map(
                    (exercise, exerciseIndex) => {
                        const trimmedName = exercise.name?.trim();

                        if (trimmedName && trimmedName.length > 0) {
                            return trimmedName;
                        }

                        // Fallback for unnamed exercises
                        return `Exercise ${exerciseIndex + 1}`;
                    }
                );

                const exercisesLine = exerciseNames.join(' • ');

                const setsLabel = `${block.sets} set${
                    block.sets === 1 ? '' : 's'
                }`;

                return {
                    id: block.id,
                    title,
                    exercisesLine,
                    setsLabel,
                };
            }),
        [workout.blocks]
    );

    return (
        <View style={st.mainWrapper}>
            <View style={st.cardContainer} ref={shareRef} collapsable={false}>
                {/* Header */}
                <View style={st.cardHeaderRow}>
                    <AppText
                        variant="captionSmall"
                        style={st.cardAppName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        HIIT Timer
                    </AppText>

                    <View style={st.cardDurationPill}>
                        <Feather
                            name="clock"
                            size={14}
                            color={theme.palette.text.muted}
                            style={st.cardDurationIcon}
                        />
                        <AppText
                            variant="captionSmall"
                            style={st.cardDurationText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {timeLabel}
                        </AppText>
                    </View>
                </View>

                {/* Title + emoji */}
                <View style={st.cardTitleBlock}>
                    <View style={st.titleRow}>
                        <AppText variant="title2" style={st.cardTitle}>
                            Workout complete
                        </AppText>

                        <AppText variant="title2" style={st.fireEmoji}>
                            🔥
                        </AppText>
                    </View>

                    <AppText
                        variant="bodySmall"
                        style={st.cardSubtitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {workout.name}
                    </AppText>
                </View>

                {/* Center section: title + circle + Summary MetaCard + blocks list */}
                <View style={st.centerSection}>
                    {/* Blocks & exercises – outside MetaCard, with bullet + sets pill + work/rest */}
                    {blocksForCard.length > 0 && (
                        <View style={st.blocksList}>
                            {blocksForCard.map((block) => (
                                <View key={block.id} style={st.blockRow}>
                                    <View
                                        style={[
                                            st.blockBullet,
                                            { backgroundColor: phaseColor },
                                        ]}
                                    />
                                    <View style={st.blockContent}>
                                        <View style={st.blockHeaderRow}>
                                            <AppText
                                                variant="bodySmall"
                                                style={st.blockTitle}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {block.title}
                                            </AppText>
                                            <View style={st.blockSetsPill}>
                                                <AppText
                                                    variant="caption"
                                                    style={st.blockSetsText}
                                                    numberOfLines={1}
                                                >
                                                    {block.setsLabel}
                                                </AppText>
                                            </View>
                                        </View>

                                        <AppText
                                            variant="bodySmall"
                                            tone="muted"
                                            style={st.blockExercises}
                                            numberOfLines={0} // allow wrapping over multiple lines
                                        >
                                            {block.exercisesLine}
                                        </AppText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Circle */}
                    <View style={st.cardArcWrapper}>
                        <View
                            style={[
                                st.cardArcCircleOuter,
                                { borderColor: phaseColor },
                            ]}
                        >
                            <AppText
                                variant="label"
                                style={st.cardArcInnerText}
                                numberOfLines={1}
                            >
                                DONE
                            </AppText>
                        </View>
                    </View>

                    {/* Overview MetaCard */}
                    <MetaCard
                        expandable={false}
                        topLeftContent={{
                            text: 'Workout summary',
                            icon: (
                                <Ionicons
                                    name="barbell-outline"
                                    size={14}
                                    color={
                                        theme.palette.metaCard.topLeftContent
                                            .text
                                    }
                                />
                            ),
                            backgroundColor:
                                theme.palette.metaCard.topLeftContent
                                    .background,
                            color: theme.palette.metaCard.topLeftContent.text,
                            borderColor:
                                theme.palette.metaCard.topLeftContent.border,
                        }}
                        summaryContent={
                            <View style={st.metaSummaryWrapper}>
                                <View style={st.metaSummaryRow}>
                                    <View style={st.metaMetric}>
                                        <AppText
                                            variant="captionSmall"
                                            tone="muted"
                                            style={st.metaMetricLabel}
                                        >
                                            Blocks
                                        </AppText>
                                        <AppText
                                            variant="bodySmall"
                                            style={st.metaMetricValue}
                                        >
                                            {summary.blocks}
                                        </AppText>
                                    </View>

                                    <View style={st.metaMetric}>
                                        <AppText
                                            variant="captionSmall"
                                            tone="muted"
                                            style={st.metaMetricLabel}
                                        >
                                            Exercises
                                        </AppText>
                                        <AppText
                                            variant="bodySmall"
                                            style={st.metaMetricValue}
                                        >
                                            {summary.exercises}
                                        </AppText>
                                    </View>

                                    <View style={st.metaMetricWide}>
                                        <AppText
                                            variant="captionSmall"
                                            tone="muted"
                                            style={st.metaMetricLabel}
                                        >
                                            Duration
                                        </AppText>
                                        <AppText
                                            variant="captionSmall"
                                            style={st.metaMetricValue}
                                            numberOfLines={2}
                                        >
                                            {timeLabel}
                                        </AppText>
                                    </View>
                                </View>
                            </View>
                        }
                    />
                </View>

                {/* Footer – date with calendar icon */}
                <View style={st.cardFooterRow}>
                    <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={theme.palette.text.muted}
                        style={st.cardFooterIcon}
                    />
                    <AppText
                        variant="captionSmall"
                        style={st.cardFooterLeft}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {completedLabel}
                    </AppText>
                </View>
            </View>
        </View>
    );
};

export default ShareWorkoutCard;
