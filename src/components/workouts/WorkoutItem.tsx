import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Workout } from '@src/core/entities/entities';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { useTheme } from '@src/theme/ThemeProvider';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import {
    summarizeWorkout,
    formatWorkoutDuration,
} from '@src/core/workouts/summarizeWorkout';
import { useWorkoutItemStyles } from './WorkoutItem.styles';
import { useTranslation } from 'react-i18next';

interface WorkoutItemProps {
    item: Workout;
    onPress?: () => void;
    onRemove?: () => void;
    onToggleFavorite?: () => void;
    isSelectMode?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
}

export const WorkoutItem: React.FC<WorkoutItemProps> = ({
    item,
    onPress,
    onRemove,
    onToggleFavorite,
    isSelectMode = false,
    isSelected = false,
    onSelect,
}) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useWorkoutItemStyles();

    const summary = useMemo(() => summarizeWorkout(item), [item]);

    const timeLabel =
        summary.approxSec > 0
            ? formatWorkoutDuration(summary.approxSec)
            : summary.hasReps
              ? t('common.status.mixedTimeAndReps')
              : t('common.status.noTimeEstimate');

    const name = item.name || t('workouts.item.untitled');
    const isFavorite = item.isFavorite === true;

    const titleLeftIcon = (() => {
        if (isSelectMode) {
            return (
                <AppIcon
                    id={isSelected ? 'checkmarkCircle' : 'radioButtonOff'}
                    size={22}
                    color={
                        isSelected
                            ? theme.palette.accent.primary
                            : theme.palette.text.secondary
                    }
                />
            );
        }
        if (onToggleFavorite) {
            return (
                <GuardedPressable
                    onPress={onToggleFavorite}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <AppIcon
                        id={isFavorite ? 'star' : 'starOutline'}
                        size={22}
                        color={
                            isFavorite
                                ? theme.palette.accent.primary
                                : theme.palette.text.secondary
                        }
                    />
                </GuardedPressable>
            );
        }
        return null;
    })();

    return (
        <MetaCard
            showSelectionOutline={isSelected}
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
                !isSelectMode && onRemove
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
            onPress={isSelectMode ? onSelect : onPress}
            summaryContent={
                <View style={st.summaryContainer}>
                    <View style={st.titleRow}>
                        {titleLeftIcon}
                        <AppText
                            variant="subtitle"
                            style={st.title}
                            numberOfLines={2}
                        >
                            {name}
                        </AppText>
                    </View>

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
                                {t('common.units.block', {
                                    count: summary.blocks,
                                })}
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
                                {t('common.units.exercise', {
                                    count: summary.exercises,
                                })}
                            </AppText>
                        </View>
                    </View>
                </View>
            }
        />
    );
};
