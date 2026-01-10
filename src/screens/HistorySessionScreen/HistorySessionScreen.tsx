import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { type ShareRunStats } from '@src/screens/WorkoutRunScreen/components/ShareWorkoutCard/ShareWorkoutCard';
import { ShareWorkoutModal } from '@src/components/modals/ShareWorkoutModal/ShareWorkoutModal';

import { useWorkout, useWorkouts } from '@state/useWorkouts';
import { useWorkoutHistory } from '@src/state/stores/useWorkoutHistory';
import { useTheme } from '@src/theme/ThemeProvider';
import { formatWorkoutDuration } from '@core/workouts/summarizeWorkout';
import { useHistorySessionStyles } from './HistorySessionScreen.styles';

/* -------------------------------------------------------------------------- */
/* screen                                                                     */
/* -------------------------------------------------------------------------- */

const HistorySessionScreen = () => {
    const router = useRouter();
    const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
    const { theme } = useTheme();
    const st = useHistorySessionStyles();

    const [shareVisible, setShareVisible] = useState(false);

    const session = useWorkoutHistory((s) =>
        sessionId ? s.sessions[sessionId] : undefined
    );

    const savedWorkout = useWorkout(session?.workoutId);
    const startDraftFromImported = useWorkouts((s) => s.startDraftFromImported);

    const hasSession = !!sessionId && !!session;

    // -------- guards --------

    if (!hasSession) {
        return (
            <MainContainer title="Session" scroll={false}>
                <View style={st.emptyContainer}>
                    <AppText variant="title3" style={st.emptyTitle}>
                        Session not found
                    </AppText>
                    <Button
                        title="Back"
                        variant="secondary"
                        onPress={() => router.back()}
                    />
                </View>
            </MainContainer>
        );
    }

    // -------- data --------

    const startedAt = new Date(session.startedAtMs);
    const startedAtLabel =
        startedAt.toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }) +
        ' • ' +
        startedAt.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        });
    const endedAt = new Date(session.endedAtMs);
    const endedAtLabel = endedAt.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });

    const stats = session.stats;

    const totalDurationText =
        session.totalDurationSec != null
            ? formatWorkoutDuration(session.totalDurationSec)
            : '—';

    const workText =
        stats?.totalWorkSec != null
            ? formatWorkoutDuration(stats.totalWorkSec)
            : '—';

    const restText =
        stats?.totalRestSec != null
            ? formatWorkoutDuration(stats.totalRestSec)
            : '—';

    const pausedText =
        stats?.totalPausedSec != null
            ? formatWorkoutDuration(stats.totalPausedSec)
            : '—';

    const completedSets = stats?.completedSets ?? 0;
    const completedSetsText = stats ? `${completedSets}` : '—';
    const isSetsZero = completedSets === 0;

    const completedExercises = stats?.completedExercises ?? 0;
    const completedExercisesText = stats ? `${completedExercises}` : '—';
    const isExercisesZero = completedExercises === 0;

    // Check if time values are zero
    const isWorkTimeZero = (stats?.totalWorkSec ?? 0) === 0;
    const isRestTimeZero = (stats?.totalRestSec ?? 0) === 0;
    const isPausedTimeZero = (stats?.totalPausedSec ?? 0) === 0;
    const isDurationZero = (session.totalDurationSec ?? 0) === 0;

    const runStats: ShareRunStats = {
        totalWorkSec: stats?.totalWorkSec ?? 0,
        totalRestSec: stats?.totalRestSec ?? 0,
        totalPrepSec: stats?.totalPrepSec ?? 0,
        totalPausedSec: stats?.totalPausedSec ?? 0,
        totalBlockPauseSec: stats?.totalBlockPauseSec ?? 0,
        completedSets: stats?.completedSets ?? 0,
        completedExercises: stats?.completedExercises ?? 0,
        completedSetsByBlock: stats?.completedSetsByBlock ?? [],
    };

    const perBlock = (() => {
        if (!stats) return [];
        const blocks = session.workoutSnapshot.blocks;

        const setsByBlock = stats.completedSetsByBlock ?? [];
        const exByBlock = stats.completedExercisesByBlock ?? [];
        const workByBlock = stats.workSecByBlock ?? [];
        const restByBlock = stats.restSecByBlock ?? [];

        const count = Math.max(
            blocks.length,
            setsByBlock.length,
            exByBlock.length,
            workByBlock.length,
            restByBlock.length
        );

        return Array.from({ length: count }, (_, i) => {
            const rawTitle = blocks[i]?.title?.trim();
            const title =
                rawTitle && rawTitle.length > 0 ? rawTitle : `Block ${i + 1}`;
            const isAutoTitle = !(rawTitle && rawTitle.length > 0);

            return {
                blockIndex: i,
                title,
                isAutoTitle,
                completedSets: setsByBlock[i] ?? 0,
                completedExercises: exByBlock[i] ?? 0,
                workSec: workByBlock[i] ?? 0,
                restSec: restByBlock[i] ?? 0,
            };
        });
    })();

    const hasCompletedBlocks = perBlock.some(
        (b) => b.completedSets > 0 || b.completedExercises > 0
    );

    // -------- actions --------

    const handleRunAgain = () => {
        if (session.workoutId && savedWorkout) {
            router.push({
                pathname: `/run/${session.workoutId}`,
                params: { autoStart: '1' },
            });
            return;
        }

        startDraftFromImported(session.workoutSnapshot);
        router.push({
            pathname: '/run',
            params: { autoStart: '1', mode: 'quick', origin: 'history' },
        });
    };

    const canRunSavedWorkout = !!session.workoutId && !!savedWorkout;

    const handleOpenWorkout = () => {
        if (!canRunSavedWorkout) return;
        router.push(`/workouts/${session.workoutId}`);
    };

    const openSharePreview = () => {
        setShareVisible(true);
    };

    const closeSharePreview = () => {
        setShareVisible(false);
    };

    // -------- UI --------

    return (
        <>
            <MainContainer title="Session" gap={0}>
                {/* Header Section */}
                <ScreenSection topSpacing="small" gap={6}>
                    <View style={st.headerRow}>
                        <View style={st.headerContainer}>
                            <AppText
                                variant="title2"
                                numberOfLines={2}
                                style={st.headerTitle}
                            >
                                {session.workoutNameSnapshot ??
                                    'Workout session'}
                            </AppText>

                            <View style={st.headerDateRow}>
                                <View style={st.headerDateItem}>
                                    <AppIcon
                                        id="calendar"
                                        size={14}
                                        color={theme.palette.text.secondary}
                                        style={st.headerIcon}
                                    />
                                    <AppText
                                        variant="bodySmall"
                                        tone="secondary"
                                    >
                                        {startedAtLabel}
                                    </AppText>
                                </View>

                                <View style={st.headerDateItem}>
                                    <AppIcon
                                        id="checkmark"
                                        size={14}
                                        color={theme.palette.text.muted}
                                        style={st.headerIcon}
                                    />
                                    <AppText variant="bodySmall" tone="muted">
                                        Ended {endedAtLabel}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                        <CircleIconButton
                            onPress={openSharePreview}
                            variant="secondary"
                            size={36}
                            style={st.headerShareButton}
                        >
                            <AppIcon
                                id="share"
                                size={18}
                                color={theme.palette.text.primary}
                            />
                        </CircleIconButton>
                    </View>
                </ScreenSection>

                {/* Overview Stats */}
                <ScreenSection title="Overview" topSpacing="medium" gap={12}>
                    <MetaCard
                        expandable={false}
                        topLeftContent={{
                            text: 'Session stats',
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
                                        tone={
                                            isDurationZero ? 'muted' : 'primary'
                                        }
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
                                        tone={
                                            isExercisesZero
                                                ? 'muted'
                                                : 'primary'
                                        }
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
                                        tone={
                                            isWorkTimeZero ? 'muted' : 'primary'
                                        }
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
                                        tone={
                                            isRestTimeZero ? 'muted' : 'primary'
                                        }
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
                                        tone={
                                            isPausedTimeZero
                                                ? 'muted'
                                                : 'primary'
                                        }
                                    >
                                        {pausedText}
                                    </AppText>
                                </View>
                            </View>
                        }
                    />
                </ScreenSection>

                {/* Blocks Breakdown */}
                {hasCompletedBlocks ? (
                    <ScreenSection
                        title="By block"
                        topSpacing="large"
                        gap={theme.layout.listItem.gap}
                    >
                        {perBlock
                            .filter(
                                (b) =>
                                    b.completedSets > 0 ||
                                    b.completedExercises > 0
                            )
                            .map((b) => (
                                <MetaCard
                                    key={`block-${b.blockIndex}`}
                                    containerStyle={st.blockCard}
                                    topLeftContent={{
                                        text: b.title,
                                        icon: (
                                            <AppIcon
                                                id="block"
                                                size={14}
                                                color={
                                                    theme.palette.metaCard
                                                        .topLeftContent.text
                                                }
                                            />
                                        ),
                                        backgroundColor:
                                            theme.palette.metaCard
                                                .topLeftContent.background,
                                        color: theme.palette.metaCard
                                            .topLeftContent.text,
                                        borderColor:
                                            theme.palette.metaCard
                                                .topLeftContent.border,
                                    }}
                                    summaryContent={
                                        <View style={st.blockStatsRow}>
                                            <View style={st.blockStatItem}>
                                                <AppText
                                                    variant="bodySmall"
                                                    tone="secondary"
                                                    style={st.blockStatLabel}
                                                >
                                                    Sets:
                                                </AppText>
                                                <AppText
                                                    variant="bodySmall"
                                                    tone={
                                                        b.completedSets === 0
                                                            ? 'muted'
                                                            : 'primary'
                                                    }
                                                >
                                                    {b.completedSets}
                                                </AppText>
                                            </View>

                                            <View style={st.blockStatItem}>
                                                <AppText
                                                    variant="bodySmall"
                                                    tone="secondary"
                                                    style={st.blockStatLabel}
                                                >
                                                    Exercises:
                                                </AppText>
                                                <AppText
                                                    variant="bodySmall"
                                                    tone={
                                                        b.completedExercises ===
                                                        0
                                                            ? 'muted'
                                                            : 'primary'
                                                    }
                                                >
                                                    {b.completedExercises}
                                                </AppText>
                                            </View>

                                            <View style={st.blockStatItem}>
                                                <AppText
                                                    variant="bodySmall"
                                                    tone="secondary"
                                                    style={st.blockStatLabel}
                                                >
                                                    Work:
                                                </AppText>
                                                <AppText
                                                    variant="bodySmall"
                                                    tone={
                                                        b.workSec === 0
                                                            ? 'muted'
                                                            : 'primary'
                                                    }
                                                >
                                                    {formatWorkoutDuration(
                                                        b.workSec
                                                    )}
                                                </AppText>
                                            </View>

                                            <View style={st.blockStatItem}>
                                                <AppText
                                                    variant="bodySmall"
                                                    tone="secondary"
                                                    style={st.blockStatLabel}
                                                >
                                                    Rest:
                                                </AppText>
                                                <AppText variant="bodySmall">
                                                    {formatWorkoutDuration(
                                                        b.restSec
                                                    )}
                                                </AppText>
                                            </View>
                                        </View>
                                    }
                                />
                            ))}
                    </ScreenSection>
                ) : (
                    <ScreenSection
                        title="By block"
                        topSpacing="large"
                        gap={theme.layout.listItem.gap}
                    >
                        <AppText variant="bodySmall" tone="muted">
                            No completed blocks in this session
                        </AppText>
                    </ScreenSection>
                )}

                {/* Actions */}
                <ScreenSection topSpacing="medium" gap={8}>
                    <View style={st.actionsContainer}>
                        <Button
                            title="Open saved workout"
                            variant="secondary"
                            onPress={handleOpenWorkout}
                            disabled={!canRunSavedWorkout}
                        />
                        {!canRunSavedWorkout && (
                            <AppText
                                variant="bodySmall"
                                tone="secondary"
                                style={st.linkHint}
                            >
                                This session isn't linked to an existing saved
                                workout.
                            </AppText>
                        )}
                    </View>
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title="Back"
                    variant="secondary"
                    onPress={() => router.back()}
                    flex
                />
                <Button
                    title="Run again"
                    variant="primary"
                    onPress={handleRunAgain}
                    flex
                />
            </FooterBar>

            {/* Share preview modal */}
            <ShareWorkoutModal
                visible={shareVisible}
                onClose={closeSharePreview}
                workout={session.workoutSnapshot}
                runStats={runStats}
            />
        </>
    );
};

export default HistorySessionScreen;
