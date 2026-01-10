import React from 'react';
import { View } from 'react-native';
import { AppText } from '@src/components/ui/Typography/AppText';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { useTheme } from '@src/theme/ThemeProvider';
import type { WorkoutSessionStats } from '@src/core/entities/workoutSession.interfaces';
import { formatWorkoutDuration } from '@src/core/workouts/summarizeWorkout';
import useFinishedCardStyles from './FinishedCard.styles';

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

    const completedSets = runStats?.completedSets ?? 0;
    const completedSetsText = runStats ? `${completedSets}` : '—';
    const isSetsZero = completedSets === 0;

    const completedExercises = runStats?.completedExercises ?? 0;
    const completedExercisesText = runStats ? `${completedExercises}` : '—';
    const isExercisesZero = completedExercises === 0;

    // Check if time values are zero
    const isWorkTimeZero = (runStats?.totalWorkSec ?? 0) === 0;
    const isRestTimeZero = (runStats?.totalRestSec ?? 0) === 0;
    const isPausedTimeZero = (runStats?.totalPausedSec ?? 0) === 0;
    const isDurationZero = (totalDurationSec ?? 0) === 0;

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
                        <View style={st.metricCard}>
                            <AppText
                                variant="caption"
                                tone="muted"
                                style={st.metricLabel}
                            >
                                Duration
                            </AppText>
                            <AppText
                                variant="body"
                                tone={isDurationZero ? 'muted' : 'primary'}
                            >
                                {totalDurationText}
                            </AppText>
                        </View>

                        <View style={st.metricCard}>
                            <AppText
                                variant="caption"
                                tone="muted"
                                style={st.metricLabel}
                            >
                                Sets
                            </AppText>
                            <AppText
                                variant="body"
                                tone={isSetsZero ? 'muted' : 'primary'}
                            >
                                {completedSetsText}
                            </AppText>
                        </View>

                        <View style={st.metricCard}>
                            <AppText
                                variant="caption"
                                tone="muted"
                                style={st.metricLabel}
                            >
                                Exercises
                            </AppText>
                            <AppText
                                variant="body"
                                tone={isExercisesZero ? 'muted' : 'primary'}
                            >
                                {completedExercisesText}
                            </AppText>
                        </View>

                        <View style={st.metricCard}>
                            <AppText
                                variant="caption"
                                tone="muted"
                                style={st.metricLabel}
                            >
                                Work time
                            </AppText>
                            <AppText
                                variant="body"
                                tone={isWorkTimeZero ? 'muted' : 'primary'}
                            >
                                {workText}
                            </AppText>
                        </View>

                        <View style={st.metricCard}>
                            <AppText
                                variant="caption"
                                tone="muted"
                                style={st.metricLabel}
                            >
                                Rest time
                            </AppText>
                            <AppText
                                variant="body"
                                tone={isRestTimeZero ? 'muted' : 'primary'}
                            >
                                {restText}
                            </AppText>
                        </View>

                        <View style={st.metricCard}>
                            <AppText
                                variant="caption"
                                tone="muted"
                                style={st.metricLabel}
                            >
                                Paused time
                            </AppText>
                            <AppText
                                variant="body"
                                tone={isPausedTimeZero ? 'muted' : 'primary'}
                            >
                                {pausedText}
                            </AppText>
                        </View>
                    </View>
                }
            />
        </View>
    );
};

export default FinishedCard;
