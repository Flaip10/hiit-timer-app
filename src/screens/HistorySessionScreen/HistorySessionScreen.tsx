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
import { useTranslation } from 'react-i18next';

export type SessionStatsMetric = {
    key: string;
    label: string;
    value: string;
    isDimmed: boolean;
};

/* -------------------------------------------------------------------------- */
/* screen                                                                     */
/* -------------------------------------------------------------------------- */

const HistorySessionScreen = () => {
    const { i18n, t } = useTranslation();
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
            <MainContainer title={t('historySession.title')} scroll={false}>
                <View style={st.emptyContainer}>
                    <AppText variant="title3" style={st.emptyTitle}>
                        {t('historySession.notFound')}
                    </AppText>
                    <Button
                        title={t('common.actions.back')}
                        variant="secondary"
                        onPress={() => router.back()}
                    />
                </View>
            </MainContainer>
        );
    }

    // -------- data --------
    const locale = i18n.resolvedLanguage ?? i18n.language;

    const startedAt = new Date(session.startedAtMs);
    const startedAtLabel =
        startedAt.toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }) +
        ' • ' +
        startedAt.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    const endedAt = new Date(session.endedAtMs);
    const endedAtLabel = endedAt.toLocaleTimeString(locale, {
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
        stats != null
            ? formatWorkoutDuration(
                  (stats.totalPausedSec ?? 0) + (stats.totalBlockPauseSec ?? 0)
              )
            : '—';

    const completedSets = stats?.completedSets ?? 0;
    const completedSetsText = stats ? `${completedSets}` : '—';

    const completedExercises = stats?.completedExercises ?? 0;
    const completedExercisesText = stats ? `${completedExercises}` : '—';

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
                rawTitle && rawTitle.length > 0
                    ? rawTitle
                    : t('common.labels.blockWithIndex', { index: i + 1 });
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

    const metrics: SessionStatsMetric[] = [
        {
            key: 'duration',
            label: t('run.stats.duration'),
            value: totalDurationText,
            isDimmed:
                session.totalDurationSec == null ||
                session.totalDurationSec === 0,
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
            isDimmed: runStats.totalWorkSec === 0,
        },
        {
            key: 'rest',
            label: t('run.stats.restTime'),
            value: restText,
            isDimmed: runStats.totalRestSec === 0,
        },
        {
            key: 'paused',
            label: t('run.stats.pausedTime'),
            value: pausedText,
            isDimmed:
                runStats.totalPausedSec + runStats.totalBlockPauseSec === 0,
        },
    ];

    // -------- actions --------

    const canOpenSavedWorkout = !!session.workoutId && !!savedWorkout;

    // Check if the saved workout matches the session version
    const savedWorkoutMatchesSessionVersion = (() => {
        if (!canOpenSavedWorkout) return false;

        const savedUpdatedAt = savedWorkout.updatedAtMs;
        const sessionUpdatedAt = session.workoutSnapshot.updatedAtMs;

        return (
            Number.isFinite(savedUpdatedAt) &&
            Number.isFinite(sessionUpdatedAt) &&
            savedUpdatedAt === sessionUpdatedAt
        );
    })();

    const handleRunAgain = () => {
        if (savedWorkoutMatchesSessionVersion && session.workoutId) {
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

    const handleOpenWorkout = () => {
        if (savedWorkoutMatchesSessionVersion && session.workoutId) {
            router.push(`/workouts/${session.workoutId}`);
            return;
        }

        // open the session snapshot (as draft) when:
        // - workout doesn't exist anymore
        // - workout exists but is a different version
        startDraftFromImported(session.workoutSnapshot);
        router.push('/workouts/edit?fromImport=1');
    };

    const canOpenWorkout = !!session.workoutSnapshot;

    const openSharePreview = () => {
        setShareVisible(true);
    };

    const closeSharePreview = () => {
        setShareVisible(false);
    };

    // -------- UI --------

    return (
        <>
            <MainContainer title={t('historySession.title')} gap={0}>
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
                                    t('historySession.workoutSessionFallback')}
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
                                        {t('historySession.endedAt', {
                                            time: endedAtLabel,
                                        })}
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
                <ScreenSection
                    title={t('workoutSummary.overview')}
                    topSpacing="medium"
                    gap={12}
                >
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
                            <View style={st.overviewRow}>
                                {metrics.map(
                                    ({ key, label, value, isDimmed }) => (
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
                                                tone={
                                                    isDimmed
                                                        ? 'muted'
                                                        : 'primary'
                                                }
                                            >
                                                {value}
                                            </AppText>
                                        </View>
                                    )
                                )}
                            </View>
                        }
                    />
                </ScreenSection>

                {/* Blocks Breakdown */}
                {hasCompletedBlocks ? (
                    <ScreenSection
                        title={t('historySession.byBlock')}
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
                                                    {t('historySession.blockStats.sets')}
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
                                                    {t(
                                                        'historySession.blockStats.exercises'
                                                    )}
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
                                                    {t('historySession.blockStats.work')}
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
                                                    {t('historySession.blockStats.rest')}
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
                        title={t('historySession.byBlock')}
                        topSpacing="large"
                        gap={theme.layout.listItem.gap}
                    >
                        <AppText variant="bodySmall" tone="muted">
                            {t('historySession.noCompletedBlocks')}
                        </AppText>
                    </ScreenSection>
                )}

                {/* Actions */}
                <ScreenSection topSpacing="medium" gap={8}>
                    <View style={st.actionsContainer}>
                        <Button
                            title={
                                savedWorkoutMatchesSessionVersion
                                    ? t('historySession.actions.openWorkout')
                                    : t('historySession.actions.saveWorkout')
                            }
                            variant="secondary"
                            onPress={handleOpenWorkout}
                            disabled={!canOpenWorkout}
                        />
                        {!canOpenSavedWorkout && (
                            <AppText
                                variant="bodySmall"
                                tone="secondary"
                                style={st.linkHint}
                            >
                                {t('historySession.hints.noSavedWorkout')}
                            </AppText>
                        )}
                        {canOpenSavedWorkout &&
                            !savedWorkoutMatchesSessionVersion && (
                                <AppText
                                    variant="bodySmall"
                                    tone="secondary"
                                    style={st.linkHint}
                                >
                                    {t(
                                        'historySession.hints.workoutEditedSinceSession'
                                    )}
                                </AppText>
                            )}
                    </View>
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title={t('common.actions.back')}
                    variant="secondary"
                    onPress={() => router.back()}
                    flex
                />
                <Button
                    title={t('historySession.actions.runAgain')}
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
