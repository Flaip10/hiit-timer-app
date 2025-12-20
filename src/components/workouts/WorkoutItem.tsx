import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Workout } from '@src/core/entities/entities';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import {
    summarizeWorkout,
    formatWorkoutDuration,
} from '@src/core/workouts/summarizeWorkout';
import { useWorkoutItemStyles } from './WorkoutItem.styles';

type WorkoutItemProps = {
    item: Workout;
    onPress?: () => void;
    onRemove?: () => void;
};

export const WorkoutItem: React.FC<WorkoutItemProps> = ({
    item,
    onPress,
    onRemove,
}) => {
    const { theme } = useTheme();
    const st = useWorkoutItemStyles();

    const summary = useMemo(() => summarizeWorkout(item), [item]);

    const timeLabel =
        summary.approxSec > 0
            ? formatWorkoutDuration(summary.approxSec)
            : summary.hasReps
              ? 'Mixed (time + reps)'
              : 'No time estimate';

    const name = item.name || 'Untitled workout';

    return (
        <MetaCard
            topLeftContent={{
                text: timeLabel,
                icon: (
                    <Ionicons
                        name="timer-outline"
                        size={14}
                        color={theme.palette.metaCard.topLeftContent.text}
                    />
                ),
                backgroundColor:
                    theme.palette.metaCard.topLeftContent.background,
                color: theme.palette.metaCard.topLeftContent.text,
                borderColor: theme.palette.metaCard.topLeftContent.border,
            }}
            actionStrip={
                onRemove
                    ? {
                          icon: (
                              <Ionicons
                                  name="trash-outline"
                                  size={18}
                                  color={
                                      theme.palette.metaCard.actionStrip.icon
                                  }
                              />
                          ),
                          backgroundColor:
                              theme.palette.metaCard.actionStrip.background,
                          onPress: onRemove,
                      }
                    : undefined
            }
            expandable={true}
            withBottomFade={false}
            minHeight={50}
            onPress={onPress}
            summaryContent={
                <View style={st.summaryContainer}>
                    <AppText
                        variant="subtitle"
                        style={st.title}
                        numberOfLines={2}
                    >
                        {name}
                    </AppText>

                    <View style={st.metaRow}>
                        <View style={st.metaItem}>
                            <Ionicons
                                name="layers-outline"
                                size={14}
                                color={theme.palette.text.secondary}
                            />
                            <AppText
                                variant="caption"
                                tone="secondary"
                                numberOfLines={1}
                            >
                                {summary.blocks}{' '}
                                {summary.blocks === 1 ? 'block' : 'blocks'}
                            </AppText>
                        </View>

                        <View style={st.metaItem}>
                            <Ionicons
                                name="barbell-outline"
                                size={14}
                                color={theme.palette.text.secondary}
                            />
                            <AppText
                                variant="caption"
                                tone="secondary"
                                numberOfLines={1}
                            >
                                {summary.exercises}{' '}
                                {summary.exercises === 1
                                    ? 'exercise'
                                    : 'exercises'}
                            </AppText>
                        </View>
                    </View>
                </View>
            }
        />
    );
};
