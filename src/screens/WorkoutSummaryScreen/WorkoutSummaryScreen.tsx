import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useWorkout, useWorkouts } from '@state/useWorkouts';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';

import {
    summarizeWorkout,
    formatWorkoutDuration,
} from '@core/workouts/summarizeWorkout';
import { exportWorkoutToFile } from '@src/core/exportWorkout/exportWorkout';

import { useTheme } from '@src/theme/ThemeProvider';
import { useWorkoutSummaryStyles } from './WorkoutSummaryScreen.styles';
import { WorkoutBlockItem } from '../EditWorkoutScreen/components/WorkoutBlockItem/WorkoutBlockItem';
import { useTranslation } from 'react-i18next';

const WorkoutSummaryScreen = () => {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const workout = useWorkout(id);
    const toggleFavorite = useWorkouts((state) => state.toggleFavorite);
    const { theme } = useTheme();
    const st = useWorkoutSummaryStyles();

    const summary = useMemo(() => summarizeWorkout(workout), [workout]);

    const [exportError, setExportError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    if (!id || !workout) {
        return (
            <MainContainer title={t('workoutSummary.title')} scroll={false}>
                <View style={st.center}>
                    <AppText variant="body" tone="danger" style={st.errorText}>
                        {t('workoutSummary.notFound')}
                    </AppText>
                    <Button
                        title={t('common.actions.back')}
                        variant="secondary"
                        onPress={() => router.back()}
                        style={st.errorButton}
                    />
                </View>
            </MainContainer>
        );
    }

    const timeLabel =
        summary.approxSec > 0
            ? formatWorkoutDuration(summary.approxSec)
            : summary.hasReps
              ? t('common.status.mixedTimeAndReps')
              : t('common.status.noTimeEstimate');
    const isFavorite = workout.isFavorite === true;

    const handleExport = async () => {
        if (exporting) return;
        setExportError(null);
        setExporting(true);

        const result = await exportWorkoutToFile(workout);

        if (!result.ok) {
            if (result.error === 'SHARING_UNAVAILABLE') {
                setExportError(t('workoutSummary.export.sharingUnavailable'));
            } else if (result.error === 'WRITE_FAILED') {
                setExportError(t('workoutSummary.export.writeFailed'));
            } else {
                setExportError(t('workoutSummary.export.failed'));
            }
        }

        setExporting(false);
    };

    return (
        <>
            <MainContainer title={workout.name} gap={0}>
                {/* Overview Section */}
                <ScreenSection
                    title={t('workoutSummary.overview')}
                    topSpacing="small"
                    gap={12}
                    rightAccessory={
                        <GuardedPressable
                            onPress={() => toggleFavorite(workout.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={st.favoriteToggle}
                        >
                            <AppIcon
                                id={isFavorite ? 'star' : 'starOutline'}
                                size={20}
                                color={
                                    isFavorite
                                        ? theme.palette.accent.primary
                                        : theme.palette.text.secondary
                                }
                            />
                            <AppText
                                variant="bodySmall"
                                style={[
                                    st.favoriteLabel,
                                    isFavorite && st.favoriteLabelActive,
                                ]}
                            >
                                {t('workoutSummary.favorite')}
                            </AppText>
                        </GuardedPressable>
                    }
                >
                    <MetaCard
                        expandable={false}
                        topLeftContent={{
                            text: t('workoutSummary.cardTitle'),
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
                            <View style={st.overviewRow}>
                                <View style={st.metricCard}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t('workoutSummary.metrics.blocks')}
                                    </AppText>
                                    <AppText
                                        variant="body"
                                        style={st.metricValue}
                                    >
                                        {summary.blocks}
                                    </AppText>
                                </View>

                                <View style={st.metricCard}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t('workoutSummary.metrics.exercises')}
                                    </AppText>
                                    <AppText
                                        variant="body"
                                        style={st.metricValue}
                                    >
                                        {summary.exercises}
                                    </AppText>
                                </View>

                                <View style={st.metricCardWide}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t('workoutSummary.metrics.estimatedTime')}
                                    </AppText>
                                    <AppText
                                        variant="bodySmall"
                                        style={st.metricValue}
                                        numberOfLines={2}
                                    >
                                        {timeLabel}
                                    </AppText>
                                </View>
                            </View>
                        }
                    />

                    <AppearingView visible={!!exportError}>
                        <ErrorBanner
                            message={exportError ?? ''}
                            onClose={() => setExportError(null)}
                        />
                    </AppearingView>
                </ScreenSection>

                {/* Blocks Section*/}
                <ScreenSection
                    title={t('workoutSummary.blocksSection')}
                    topSpacing="large"
                    gap={theme.layout.listItem.gap}
                >
                    {workout.blocks.map((block, index) => (
                        <WorkoutBlockItem
                            key={block.id}
                            index={index}
                            block={block}
                        />
                    ))}
                </ScreenSection>

                {/* Hint + Share Section*/}
                <ScreenSection topSpacing="medium" gap={8}>
                    <AppText
                        variant="caption"
                        tone="muted"
                        style={st.hint}
                        numberOfLines={2}
                    >
                        {t('workoutSummary.hint')}
                    </AppText>

                    <View style={st.exportContainer}>
                        <CircleIconButton
                            onPress={handleExport}
                            variant="secondary"
                            size={50}
                            disabled={exporting}
                        >
                            <Ionicons
                                name="share-outline"
                                size={24}
                                color={theme.palette.text.primary}
                            />
                        </CircleIconButton>
                        <AppText
                            variant="bodySmall"
                            tone="muted"
                            style={st.exportText}
                        >
                            {t('workoutSummary.shareWorkout')}
                        </AppText>
                    </View>
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title={t('workoutSummary.actions.edit')}
                    variant="secondary"
                    flex={1}
                    onPress={() =>
                        router.push({
                            pathname: '/workouts/edit',
                            params: { id },
                        })
                    }
                />
                <Button
                    title={t('workoutSummary.actions.start')}
                    variant="primary"
                    flex={1}
                    onPress={() =>
                        router.push({
                            pathname: `/run/${id}`,
                            params: { autoStart: '1' },
                        })
                    }
                />
            </FooterBar>
        </>
    );
};

export default WorkoutSummaryScreen;
