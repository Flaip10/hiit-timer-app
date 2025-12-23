import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';

import { useWorkout } from '@state/useWorkouts';
import { useWorkouts } from '@state/useWorkouts';
import { useWorkoutHistory } from '@src/state/stores/useWorkoutHistory';

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const formatDuration = (sec?: number) => {
    const s = Math.max(0, sec ?? 0);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${pad2(ss)}`;
};

const sum = (arr?: number[]) =>
    (arr ?? []).reduce(
        (acc, n) => acc + (Number.isFinite(n) ? (n ?? 0) : 0),
        0
    );

/* -------------------------------------------------------------------------- */
/* screen                                                                     */
/* -------------------------------------------------------------------------- */

const HistorySessionScreen = () => {
    const router = useRouter();
    const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

    const session = useWorkoutHistory((s) =>
        sessionId ? s.sessions[sessionId] : undefined
    );

    const savedWorkout = useWorkout(session?.workoutId);
    const startDraftFromImported = useWorkouts((s) => s.startDraftFromImported);

    // IMPORTANT: derive everything with hooks BEFORE any early return.
    const hasSession = !!sessionId && !!session;

    const startedAt = useMemo(
        () => new Date(session?.startedAtMs ?? 0),
        [session?.startedAtMs]
    );

    const endedAt = useMemo(
        () => new Date(session?.endedAtMs ?? 0),
        [session?.endedAtMs]
    );

    const stats = session?.stats;

    const totalDurationText = useMemo(
        () =>
            session?.totalDurationSec != null
                ? formatDuration(session.totalDurationSec)
                : '—',
        [session?.totalDurationSec]
    );

    const workText = useMemo(
        () => (stats ? formatDuration(stats.totalWorkSec) : '—'),
        [stats?.totalWorkSec]
    );

    const restText = useMemo(
        () => (stats ? formatDuration(stats.totalRestSec) : '—'),
        [stats?.totalRestSec]
    );

    const completedSetsText = useMemo(() => {
        if (!stats) return '—';
        return `${stats.completedSets}`;
    }, [stats?.completedSets]);

    const completedExercisesText = useMemo(() => {
        if (!stats) return '—';
        return `${stats.completedExercises}`;
    }, [stats?.completedExercises]);

    const totalsFromArrays = useMemo(() => {
        if (!stats) return null;
        return {
            byBlockWork: sum(stats.workSecByBlock),
            byBlockRest: sum(stats.restSecByBlock),
        };
    }, [stats?.workSecByBlock, stats?.restSecByBlock]);

    const perBlock = useMemo(() => {
        if (!session) return [];

        const plannedBlocks = session.workoutSnapshot?.blocks?.length ?? 0;

        const setsByBlock = session.stats?.completedSetsByBlock ?? [];
        const exByBlock = session.stats?.completedExercisesByBlock ?? [];
        const workByBlock = session.stats?.workSecByBlock ?? [];
        const restByBlock = session.stats?.restSecByBlock ?? [];

        const count = Math.max(
            plannedBlocks,
            setsByBlock.length,
            exByBlock.length,
            workByBlock.length,
            restByBlock.length
        );

        return Array.from({ length: count }, (_, i) => ({
            blockIndex: i,
            title:
                session.workoutSnapshot?.blocks?.[i]?.title?.trim() ||
                `Block ${i + 1}`,
            completedSets: setsByBlock[i] ?? 0,
            completedExercises: exByBlock[i] ?? 0,
            workSec: workByBlock[i] ?? 0,
            restSec: restByBlock[i] ?? 0,
        }));
    }, [session]);

    // -------- guards (AFTER hooks) --------

    if (!hasSession) {
        return (
            <MainContainer title="Session" scroll={false}>
                <View style={{ gap: 12 }}>
                    <AppText variant="title3">Session not found</AppText>
                    <Button
                        title="Back"
                        variant="secondary"
                        onPress={() => router.back()}
                    />
                </View>
            </MainContainer>
        );
    }

    // From here on, session is guaranteed
    const safeSession = session!;

    // -------- actions --------

    const handleRunAgain = () => {
        if (safeSession.workoutId && savedWorkout) {
            router.push({
                pathname: `/run/${safeSession.workoutId}`,
                params: { autoStart: '1' },
            });
            return;
        }

        startDraftFromImported(safeSession.workoutSnapshot);
        router.push('/run?mode=quick&origin=history');
    };

    const handleOpenWorkout = () => {
        if (!safeSession.workoutId || !savedWorkout) return;
        router.push(`/workouts/${safeSession.workoutId}`);
    };

    // -------- UI --------

    console.log('Stats: ', stats);

    return (
        <>
            <MainContainer title="Session" scroll={false}>
                <View style={{ gap: 18 }}>
                    {/* Header */}
                    <View style={{ gap: 6 }}>
                        <AppText variant="title3" numberOfLines={2}>
                            {safeSession.workoutNameSnapshot ??
                                'Workout session'}
                        </AppText>

                        <AppText variant="bodySmall" tone="secondary">
                            {startedAt.toLocaleString()}
                        </AppText>

                        <AppText variant="bodySmall" tone="secondary">
                            Ended at {endedAt.toLocaleTimeString()}
                        </AppText>
                    </View>

                    {/* Summary */}
                    <View style={{ gap: 10 }}>
                        <AppText variant="subtitle">Summary</AppText>

                        <View style={{ gap: 6 }}>
                            <AppText variant="body">
                                Duration: {totalDurationText}
                            </AppText>

                            <AppText variant="body">
                                Completed sets: {completedSetsText}
                            </AppText>

                            <AppText variant="body">
                                Completed exercises: {completedExercisesText}
                            </AppText>

                            <AppText variant="body">
                                Work time: {workText}
                            </AppText>

                            <AppText variant="body">
                                Rest time: {restText}
                            </AppText>

                            {totalsFromArrays && (
                                <AppText variant="bodySmall" tone="secondary">
                                    By-block totals (sanity): work{' '}
                                    {formatDuration(
                                        totalsFromArrays.byBlockWork
                                    )}{' '}
                                    · rest{' '}
                                    {formatDuration(
                                        totalsFromArrays.byBlockRest
                                    )}
                                </AppText>
                            )}
                        </View>
                    </View>

                    {/* Per-block breakdown */}
                    <View style={{ gap: 10 }}>
                        <AppText variant="subtitle">By block</AppText>

                        <View style={{ gap: 10 }}>
                            {perBlock.map((b) => (
                                <View
                                    key={`block-${b.blockIndex}`}
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 12,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.08)',
                                        backgroundColor:
                                            'rgba(255,255,255,0.03)',
                                        gap: 6,
                                    }}
                                >
                                    <AppText variant="body" numberOfLines={2}>
                                        {b.title}
                                    </AppText>

                                    <AppText
                                        variant="bodySmall"
                                        tone="secondary"
                                    >
                                        Sets: {b.completedSets} · Exercises:{' '}
                                        {b.completedExercises}
                                    </AppText>

                                    <AppText
                                        variant="bodySmall"
                                        tone="secondary"
                                    >
                                        Work: {formatDuration(b.workSec)} ·
                                        Rest: {formatDuration(b.restSec)}
                                    </AppText>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Saved workout link */}
                    <View style={{ gap: 8 }}>
                        <Button
                            title="Open saved workout"
                            variant="secondary"
                            onPress={handleOpenWorkout}
                            disabled={!safeSession.workoutId || !savedWorkout}
                        />
                        {!safeSession.workoutId || !savedWorkout ? (
                            <AppText variant="bodySmall" tone="secondary">
                                This session isn’t linked to an existing saved
                                workout.
                            </AppText>
                        ) : null}
                    </View>
                </View>
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
        </>
    );
};

export default HistorySessionScreen;
