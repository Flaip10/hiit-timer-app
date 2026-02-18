import React from 'react';
import { View } from 'react-native';
import { AppText } from '@src/components/ui/Typography/AppText';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { useTheme } from '@src/theme/ThemeProvider';
import type { WorkoutSessionStats } from '@src/core/entities/workoutSession.interfaces';
import { formatWorkoutDuration } from '@src/core/workouts/summarizeWorkout';
import useFinishedCardStyles from './FinishedCard.styles';
import type { SessionStatsMetric } from '@src/screens/HistorySessionScreen/HistorySessionScreen';
import { useTranslation } from 'react-i18next';

type FinishedCardProps = {
    runStats?: WorkoutSessionStats;
    totalDurationSec?: number;
};

export const FinishedCard = ({
    runStats,
    totalDurationSec,
}: FinishedCardProps) => {
    const { t } = useTranslation();
    const st = useFinishedCardStyles();
    const { theme } = useTheme();

    const totalDurationText =
        totalDurationSec != null
            ? formatWorkoutDuration(totalDurationSec)
            : '—';

    const workText =
        runStats?.totalWorkSec != null
            ? formatWorkoutDuration(runStats.totalWorkSec)
            : '—';

    const restText =
        runStats?.totalRestSec != null
            ? formatWorkoutDuration(runStats.totalRestSec)
            : '—';

    const pausedText =
        runStats != null
            ? formatWorkoutDuration(
                  (runStats.totalPausedSec ?? 0) +
                      (runStats.totalBlockPauseSec ?? 0)
              )
            : '—';

    const completedSets = runStats?.completedSets;
    const completedSetsText = runStats ? `${completedSets}` : '—';

    const completedExercises = runStats?.completedExercises ?? 0;
    const completedExercisesText = runStats ? `${completedExercises}` : '—';

    const metrics: SessionStatsMetric[] = [
        {
            key: 'duration',
            label: t('run.stats.duration'),
            value: totalDurationText,
            isDimmed: totalDurationSec == null || totalDurationSec === 0,
        },
        {
            key: 'sets',
            label: t('run.stats.sets'),
            value: completedSetsText,
            isDimmed: completedSets === 0,
        },
        {
            key: 'exercises',
            label: t('run.stats.exercises'),
            value: completedExercisesText,
            isDimmed: completedExercises === 0,
        },
        {
            key: 'work',
            label: t('run.stats.workTime'),
            value: workText,
            isDimmed: runStats?.totalWorkSec === 0,
        },
        {
            key: 'rest',
            label: t('run.stats.restTime'),
            value: restText,
            isDimmed: runStats?.totalRestSec === 0,
        },
        {
            key: 'paused',
            label: t('run.stats.pausedTime'),
            value: pausedText,
            isDimmed:
                ((runStats?.totalPausedSec ?? 0) +
                    (runStats?.totalBlockPauseSec ?? 0)) ===
                0,
        },
    ];
    const metricRows: SessionStatsMetric[][] = [
        metrics.slice(0, 3),
        metrics.slice(3, 6),
    ];

    return (
        <View style={st.finishedCard}>
            <MetaCard
                expandable={false}
                topLeftContent={{
                    text: t('run.stats.title'),
                    icon: (
                        <AppIcon
                            id="stats"
                            size={14}
                            color={theme.palette.metaCard.topLeftContent.text}
                        />
                    ),
                    backgroundColor:
                        theme.palette.metaCard.topLeftContent.background,
                    color: theme.palette.metaCard.topLeftContent.text,
                    borderColor: theme.palette.metaCard.topLeftContent.border,
                }}
                summaryContent={
                    <View style={st.overviewRow}>
                        {metricRows.map((row, rowIndex) => (
                            <View
                                key={`finished-metrics-row-${rowIndex}`}
                                style={st.overviewMetricsRow}
                            >
                                {row.map(({ key, label, value, isDimmed }) => (
                                    <View key={key} style={st.metricCard}>
                                        <View style={st.metricLabelSlot}>
                                            <AppText
                                                variant="caption"
                                                tone="muted"
                                                style={st.metricLabel}
                                                numberOfLines={2}
                                            >
                                                {label}
                                            </AppText>
                                        </View>
                                        <AppText
                                            variant="body"
                                            tone={
                                                isDimmed ? 'muted' : 'primary'
                                            }
                                        >
                                            {value}
                                        </AppText>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                }
            />
        </View>
    );
};

export default FinishedCard;
