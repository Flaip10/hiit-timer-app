import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useWorkout } from '@state/useWorkouts';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';

import {
    summarizeWorkout,
    formatWorkoutDuration,
} from '@core/workouts/summarizeWorkout';
import { exportWorkoutToFile } from '@src/core/exportWorkout/exportWorkout';

import { useTheme } from '@src/theme/ThemeProvider';
import { useWorkoutSummaryStyles } from './WorkoutSummaryScreen.styles';
import { WorkoutBlockItem } from '../EditWorkoutScreen/components/WorkoutBlockItem/WorkoutBlockItem';

const WorkoutSummaryScreen = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const workout = useWorkout(id);
    const { theme } = useTheme();
    const st = useWorkoutSummaryStyles();

    const summary = useMemo(() => summarizeWorkout(workout), [workout]);

    const [exportError, setExportError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    if (!id || !workout) {
        return (
            <MainContainer title="Workout" scroll={false}>
                <View style={st.center}>
                    <AppText variant="body" tone="danger" style={st.errorText}>
                        Workout not found.
                    </AppText>
                    <Button
                        title="Back"
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
              ? 'Mixed (time + reps)'
              : 'No time estimate';

    const handleExport = async () => {
        if (exporting) return;
        setExportError(null);
        setExporting(true);

        const result = await exportWorkoutToFile(workout);

        if (!result.ok) {
            if (result.error === 'SHARING_UNAVAILABLE') {
                setExportError('Sharing is not available on this device.');
            } else if (result.error === 'WRITE_FAILED') {
                setExportError('Could not prepare the file for sharing.');
            } else {
                setExportError('Failed to export workout.');
            }
        }

        setExporting(false);
    };

    return (
        <>
            <MainContainer title={workout.name} gap={0}>
                {/* Overview Section */}
                <ScreenSection title="Overview" topSpacing="small" gap={12}>
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
                            <View style={st.overviewRow}>
                                <View style={st.metricCard}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        Blocks
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
                                        Exercises
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
                                        Estimated time
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
                    title="Blocks"
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
                        You can edit this workout or start it now.
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
                            Share workout
                        </AppText>
                    </View>
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title="Edit"
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
                    title="Start"
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
