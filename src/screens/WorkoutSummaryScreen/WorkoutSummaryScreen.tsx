import { useMemo, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useWorkout } from '@state/useWorkouts';
import { MainContainer } from '@src/components/layout/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import { isRepsPace, isTimePace } from '@src/core/entities';

import {
    summarizeWorkout,
    formatWorkoutDuration,
} from '@core/workouts/summarizeWorkout';
import st from './styles';
import { Ionicons } from '@expo/vector-icons';
import { exportWorkoutToFile } from '@src/core/exportWorkout/exportWorkout';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';

const WorkoutSummaryScreen = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const workout = useWorkout(id);

    const summary = useMemo(() => summarizeWorkout(workout), [workout]);

    const [exportError, setExportError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    if (!id || !workout) {
        return (
            <MainContainer title="Workout" scroll={false}>
                <View style={st.center}>
                    <Text style={st.errorText}>Workout not found.</Text>
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
                setExportError(
                    'Could not prepare the workout file for sharing.'
                );
            } else if (result.error === 'SHARE_FAILED') {
                setExportError(
                    'Something went wrong while opening the share sheet.'
                );
            }
        }

        setExporting(false);
    };

    return (
        <>
            <MainContainer title={workout.name}>
                <View style={st.card}>
                    <Text style={st.cardTitle}>Overview</Text>
                    <View style={st.metricRow}>
                        <View style={st.metric}>
                            <Text style={st.metricLabel}>Blocks</Text>
                            <Text style={st.metricValue}>{summary.blocks}</Text>
                        </View>
                        <View style={st.metric}>
                            <Text style={st.metricLabel}>Exercises</Text>
                            <Text style={st.metricValue}>
                                {summary.exercises}
                            </Text>
                        </View>
                        <View style={st.metric}>
                            <Text style={st.metricLabel}>Estimated time</Text>
                            <Text style={st.metricValue}>{timeLabel}</Text>
                        </View>
                    </View>
                </View>

                <AppearingView visible={!!exportError}>
                    <ErrorBanner
                        message={exportError ?? ''}
                        onClose={() => setExportError(null)}
                    />
                </AppearingView>

                <Text style={st.sectionTitle}>Blocks</Text>
                {workout.blocks.map((block, index) => {
                    const paceLabel = isTimePace(block.defaultPace)
                        ? `${block.defaultPace.workSec}s work`
                        : isRepsPace(block.defaultPace)
                          ? `${block.defaultPace.reps} reps`
                          : '';

                    return (
                        <View key={block.id} style={st.blockItem}>
                            <Text style={st.blockTitle}>
                                Block {index + 1}
                                {block.title ? ` — ${block.title}` : ''}
                            </Text>
                            <Text style={st.blockMeta}>
                                {block.scheme.sets} sets •{' '}
                                {block.exercises.length} exercises
                                {paceLabel ? ` • ${paceLabel}` : ''}
                            </Text>
                        </View>
                    );
                })}

                <Text style={st.hint}>
                    You can edit this workout or start it now. The timer will
                    follow the configured sets, rests and exercise order.
                </Text>

                <View style={st.exportContainer}>
                    <CircleIconButton
                        onPress={handleExport}
                        variant="secondary"
                        size={50}
                    >
                        <Ionicons
                            name="share-outline"
                            size={24}
                            color="#E5E7EB"
                        />
                    </CircleIconButton>
                    <Text style={st.exportText}>Share workout</Text>
                </View>
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
