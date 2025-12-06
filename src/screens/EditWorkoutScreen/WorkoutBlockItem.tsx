import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { WorkoutBlock } from '@src/core/entities';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useWorkoutBlockItemStyles } from './WorkoutBlockItem.styles';

type WorkoutBlockItemProps = {
    index: number; // label only
    block: WorkoutBlock;
    onEdit: (id: string) => void;
    onRemove: (id: string) => void;
};

export const WorkoutBlockItem = ({
    index,
    block,
    onEdit,
    onRemove,
}: WorkoutBlockItemProps) => {
    const { theme } = useTheme();
    const st = useWorkoutBlockItemStyles();
    const { sets, exercises, title } = block;

    const exerciseSummary = useMemo(() => {
        if (exercises.length === 0) return '';

        const first = exercises[0];
        const allSame = exercises.every(
            (ex) => ex.mode === first.mode && ex.value === first.value
        );

        if (!allSame) return '';

        if (first.mode === 'time') {
            return `${first.value}s each`;
        }

        // reps mode kept for future extension

        return `${first.value} reps each`;
    }, [exercises]);

    const metaParts = useMemo(() => {
        const parts: string[] = [
            `${sets} ${sets === 1 ? 'set' : 'sets'}`,
            `${exercises.length} ${
                exercises.length === 1 ? 'exercise' : 'exercises'
            }`,
        ];
        if (exerciseSummary) parts.push(exerciseSummary);
        return parts;
    }, [sets, exercises.length, exerciseSummary]);

    const blockLabel = `Block ${index + 1}` + (title ? ` — ${title}` : '');

    const formatExerciseMeta = (
        mode: WorkoutBlock['exercises'][number]['mode'],
        value: number,
        restSec?: number
    ): string => {
        const main =
            mode === 'time'
                ? `${value}s`
                : `${value} rep${value === 1 ? '' : 's'}`;

        if (restSec && restSec > 0) {
            return `${main} • Rest ${restSec}s`;
        }

        return main;
    };

    return (
        <MetaCard
            topLeftContent={{
                text: blockLabel,
                icon: (
                    <Ionicons
                        name="layers-outline"
                        size={14}
                        color={theme.palette.metaCard.topLeftContent.text}
                    />
                ),
                backgroundColor:
                    theme.palette.metaCard.topLeftContent.background,
                color: theme.palette.metaCard.topLeftContent.text,
                borderColor: theme.palette.metaCard.topLeftContent.border,
            }}
            actionStrip={{
                icon: (
                    <Ionicons
                        name="trash-outline"
                        size={18}
                        color={theme.palette.metaCard.actionStrip.icon}
                    />
                ),
                backgroundColor: theme.palette.metaCard.actionStrip.background,
                onPress: () => onRemove(block.id),
            }}
            expandable
            withBottomFade={false}
            minHeight={0}
            onPress={() => onEdit(block.id)}
            summaryContent={
                <View style={st.body}>
                    <View style={st.blockInfoRow}>
                        <Ionicons
                            name="timer-outline"
                            size={14}
                            color={theme.palette.metaCard.statusBadge.text}
                        />
                        <AppText variant="bodySmall" tone="secondary">
                            {metaParts.join(' • ')}
                        </AppText>
                    </View>
                </View>
            }
            collapsibleContent={
                <View style={st.body}>
                    <View style={st.exercisesContainer}>
                        {exercises.map((ex, i) => (
                            <View key={ex.id ?? i} style={st.exerciseRow}>
                                <View style={st.exerciseIndexBubble}>
                                    <AppText
                                        variant="caption"
                                        style={st.exerciseIndexText}
                                    >
                                        {i + 1}
                                    </AppText>
                                </View>

                                <View style={st.exerciseTexts}>
                                    <AppText
                                        variant="bodySmall"
                                        tone="primary"
                                        numberOfLines={1}
                                    >
                                        {ex.name ?? `Exercise ${i + 1}`}
                                    </AppText>

                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        numberOfLines={1}
                                    >
                                        {formatExerciseMeta(ex.mode, ex.value)}
                                    </AppText>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            }
        />
    );
};
