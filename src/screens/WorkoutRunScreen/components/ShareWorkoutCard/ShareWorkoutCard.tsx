import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import type { Workout } from '@src/core/entities/entities';
import { formatWorkoutDuration } from '@core/workouts/summarizeWorkout';

import { AppText } from '@src/components/ui/Typography/AppText';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppLogo } from '@src/components/ui/AppLogo/AppLogo';
import { Watermark } from '@src/components/ui/Watermark/Watermark';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { useTheme } from '@src/theme/ThemeProvider';
import { useShareWorkoutCardStyles } from './ShareWorkoutCard.styles';
import { useTranslation } from 'react-i18next';

export type ShareRunStats = {
    totalWorkSec: number;
    totalRestSec: number;
    totalPrepSec: number;
    totalPausedSec: number;
    totalBlockPauseSec: number;

    completedSets: number;
    completedExercises: number;

    completedSetsByBlock: number[];
};

type ShareWorkoutCardProps = {
    workout: Workout;
    shareRef: React.RefObject<View | null>;
    runStats: ShareRunStats;
};

type ShareBlockLine = {
    id: string;
    title: string;
    exercisesLine: string;
    setsLabel: string;
};

const buildCompletedLabel = (locale: string | undefined): string => {
    const now = new Date();

    const datePart = now.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const timePart = now.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${datePart} • ${timePart}`;
};

export const ShareWorkoutCard = ({
    workout,
    shareRef,
    runStats,
}: ShareWorkoutCardProps) => {
    const { i18n, t } = useTranslation();
    const { theme } = useTheme();
    const st = useShareWorkoutCardStyles();

    const locale = i18n.resolvedLanguage ?? i18n.language;
    const completedLabel = buildCompletedLabel(locale);

    const elapsedSec =
        runStats.totalWorkSec +
        runStats.totalRestSec +
        runStats.totalPausedSec +
        runStats.totalBlockPauseSec;

    const durationText = formatWorkoutDuration(elapsedSec);

    const blocksForCard = useMemo<ShareBlockLine[]>(
        () =>
            workout.blocks
                .map((block, index) => {
                    const completedSets =
                        runStats.completedSetsByBlock[index] ?? 0;

                    // Only show blocks where at least one set was completed
                    if (completedSets <= 0) return null;

                    const title =
                        block.title && block.title.trim().length > 0
                            ? block.title.trim()
                            : t('common.labels.blockWithIndex', {
                                  index: index + 1,
                              });

                    const exerciseNames = block.exercises.map(
                        (exercise, exIdx) => {
                            const trimmedName = exercise.name?.trim();
                            return trimmedName && trimmedName.length > 0
                                ? trimmedName
                                : t('common.labels.exerciseWithIndex', {
                                      index: exIdx + 1,
                                  });
                        }
                    );

                    const exercisesLine = exerciseNames.join(' • ');

                    const setsLabel = t('common.units.set', {
                        count: completedSets,
                    });

                    return {
                        id: block.id,
                        title,
                        exercisesLine,
                        setsLabel,
                    };
                })
                .filter((b): b is ShareBlockLine => b !== null),
        [workout.blocks, runStats.completedSetsByBlock, t]
    );

    return (
        <View style={st.mainWrapper}>
            <View style={st.cardContainer} ref={shareRef} collapsable={false}>
                <Watermark
                    watermarkMode="medium"
                    watermarkPosition="center"
                    sizeScale={1.2}
                    style={st.cardWatermark}
                />
                {/* Header */}
                <View style={st.cardHeaderRow}>
                    <View style={st.cardHeaderLeft}>
                        <AppLogo size={20} logoMode="theme" />
                        <AppText
                            variant="captionSmall"
                            style={st.cardAppName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            ARC TIMER
                        </AppText>
                    </View>

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
                            {durationText}
                        </AppText>
                    </View>
                </View>

                {/* Title + emoji */}
                <View style={st.cardTitleBlock}>
                    <View style={st.titleRow}>
                        <AppText variant="title2" style={st.cardTitle}>
                            {t('run.shareCard.title')}
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

                {/* Center section: blocks list + circle + overview MetaCard */}
                <View style={st.centerSection}>
                    {/* Blocks & exercises – show only what was actually done */}
                    {blocksForCard.length > 0 && (
                        <View style={st.blocksList}>
                            {blocksForCard.map((block) => (
                                <View key={block.id} style={st.blockRow}>
                                    <View
                                        style={[
                                            st.blockBullet,
                                            {
                                                backgroundColor:
                                                    theme.palette.accent
                                                        .primary,
                                            },
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
                                            numberOfLines={0}
                                        >
                                            {block.exercisesLine}
                                        </AppText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Overview MetaCard */}
                    <MetaCard
                        expandable={false}
                        topLeftContent={{
                            text: t('run.stats.title'),
                            icon: (
                                <AppIcon
                                    id="stats"
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
                                            {t('run.stats.duration')}
                                        </AppText>
                                        <AppText
                                            variant="bodySmall"
                                            style={st.metaMetricValue}
                                        >
                                            {durationText}
                                        </AppText>
                                    </View>

                                    <View style={st.metaMetric}>
                                        <AppText
                                            variant="captionSmall"
                                            tone="muted"
                                            style={st.metaMetricLabel}
                                        >
                                            {t('run.stats.sets')}
                                        </AppText>
                                        <AppText
                                            variant="bodySmall"
                                            style={st.metaMetricValue}
                                        >
                                            {runStats.completedSets}
                                        </AppText>
                                    </View>

                                    <View style={st.metaMetric}>
                                        <AppText
                                            variant="captionSmall"
                                            tone="muted"
                                            style={st.metaMetricLabel}
                                        >
                                            {t('run.stats.exercises')}
                                        </AppText>
                                        <AppText
                                            variant="bodySmall"
                                            style={st.metaMetricValue}
                                        >
                                            {runStats.completedExercises}
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
