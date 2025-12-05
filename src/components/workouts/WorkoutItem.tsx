import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Workout } from '@src/core/entities';
import {
    summarizeWorkout,
    formatWorkoutDuration,
} from '@src/core/workouts/summarizeWorkout';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

type WorkoutItemProps = {
    item: Workout;
    onPress: () => void;
    onEdit: () => void;
    onRemove: () => void;
};

export const WorkoutItem = ({
    item,
    onPress,
    onEdit,
    onRemove,
}: WorkoutItemProps) => {
    const { theme } = useTheme();
    const summary = useMemo(() => summarizeWorkout(item), [item]);

    const timeLabel =
        summary.approxSec > 0
            ? formatWorkoutDuration(summary.approxSec)
            : summary.hasReps
              ? 'Mixed (time + reps)'
              : 'No time estimate';

    const extraInfoText = `${summary.blocks} block${summary.blocks === 1 ? '' : 's'} • ${summary.exercises} exercise${summary.exercises === 1 ? '' : 's'}`;

    return (
        <MetaCard
            onPress={onPress}
            topLeftContent={{
                text: timeLabel,
                icon: (
                    <Ionicons
                        name="time-outline"
                        size={14}
                        color={theme.palette.metaCard.topLeftContent.text}
                    />
                ),
            }}
            actionButton={{
                icon: (
                    <Ionicons
                        name="create-outline"
                        size={18}
                        color={theme.palette.metaCard.actionButton.icon}
                    />
                ),
                onPress: onEdit,
            }}
            secondaryActionButton={{
                icon: (
                    <Ionicons
                        name="trash-outline"
                        size={18}
                        color={theme.palette.feedback.errorIcon}
                    />
                ),
                onPress: onRemove,
            }}
            expandable
            withBottomFade={false}
            minHeight={50}
        >
            <View style={st.contentContainer}>
                <AppText
                    variant="subtitle"
                    tone="primary"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.name}
                </AppText>

                <View style={st.extraRow}>
                    <AppText
                        variant="bodySmall"
                        tone="muted"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {extraInfoText}
                    </AppText>
                </View>
            </View>
        </MetaCard>
    );
};

const st = StyleSheet.create({
    contentContainer: { gap: 4, padding: 4 },
    extraRow: {
        marginTop: 4,
    },
});
