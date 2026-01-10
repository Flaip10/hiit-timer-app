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

type FinishedCardProps = {
    runStats?: WorkoutSessionStats;
    totalDurationSec?: number;
};

export const FinishedCard = ({
    runStats,
    totalDurationSec,
}: FinishedCardProps) => {
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
        runStats?.totalPausedSec != null
            ? formatWorkoutDuration(runStats.totalPausedSec)
            : '—';

    const completedSets = runStats?.completedSets;
    const completedSetsText = runStats ? `${completedSets}` : '—';

    const completedExercises = runStats?.completedExercises ?? 0;
    const completedExercisesText = runStats ? `${completedExercises}` : '—';

    const metrics: SessionStatsMetric[] = [
        {
            key: 'duration',
            label: 'Duration',
            value: totalDurationText,
            isDimmed: totalDurationSec == null || totalDurationSec === 0,
        },
        {
            key: 'sets',
            label: 'Sets',
            value: completedSetsText,
            isDimmed: completedSets === 0,
        },
        {
            key: 'exercises',
            label: 'Exercises',
            value: completedExercisesText,
            isDimmed: completedExercises === 0,
        },
        {
            key: 'work',
            label: 'Work time',
            value: workText,
            isDimmed: runStats?.totalWorkSec === 0,
        },
        {
            key: 'rest',
            label: 'Rest time',
            value: restText,
            isDimmed: runStats?.totalRestSec === 0,
        },
        {
            key: 'paused',
            label: 'Paused time',
            value: pausedText,
            isDimmed: runStats?.totalPausedSec === 0,
        },
    ];

    return (
        <View style={st.finishedCard}>
            <MetaCard
                expandable={false}
                topLeftContent={{
                    text: 'Session stats',
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
                        {metrics.map(({ key, label, value, isDimmed }) => (
                            <View key={key} style={st.metricCard}>
                                <AppText
                                    variant="caption"
                                    tone="muted"
                                    style={st.metricLabel}
                                >
                                    {label}
                                </AppText>
                                <AppText
                                    variant="body"
                                    tone={isDimmed ? 'muted' : 'primary'}
                                >
                                    {value}
                                </AppText>
                            </View>
                        ))}
                    </View>
                }
            />
        </View>
    );
};

export default FinishedCard;
