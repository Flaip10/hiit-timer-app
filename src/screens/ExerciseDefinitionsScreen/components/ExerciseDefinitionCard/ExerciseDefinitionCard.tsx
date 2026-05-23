import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { ExerciseDefinition } from '@src/core/entities/entities';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useExerciseDefinitionCardStyles } from './ExerciseDefinitionCard.styles';

interface ExerciseDefinitionCardProps {
    item: ExerciseDefinition;
    onPress?: () => void;
}

const sourceLabelKeyBySource = {
    system: 'exerciseDefinitions.source.system',
    user: 'exerciseDefinitions.source.user',
} as const;

const availabilityLabelKeyByAvailability = {
    both: 'exerciseDefinitions.availability.both',
    gym: 'exerciseDefinitions.availability.gym',
    workout: 'exerciseDefinitions.availability.workout',
} as const;

export const ExerciseDefinitionCard = ({
    item,
    onPress,
}: ExerciseDefinitionCardProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseDefinitionCardStyles();

    return (
        <MetaCard
            expandable={false}
            withBottomFade={false}
            minHeight={50}
            onPress={onPress}
            topLeftContent={{
                text: t(sourceLabelKeyBySource[item.source]),
                icon: (
                    <Ionicons
                        name={
                            item.source === 'system'
                                ? 'sparkles-outline'
                                : 'person-outline'
                        }
                        size={14}
                        color={theme.palette.metaCard.topLeftContent.text}
                    />
                ),
                backgroundColor:
                    theme.palette.metaCard.topLeftContent.background,
                color: theme.palette.metaCard.topLeftContent.text,
                borderColor: theme.palette.metaCard.topLeftContent.border,
            }}
            summaryContent={
                <View style={st.summaryContainer}>
                    <AppText
                        variant="subtitle"
                        style={st.title}
                        numberOfLines={2}
                    >
                        {item.name}
                    </AppText>

                    <View style={st.metaRow}>
                        <View style={st.metaItem}>
                            <Ionicons
                                name="options-outline"
                                size={14}
                                color={theme.palette.text.secondary}
                            />
                            <AppText
                                variant="caption"
                                tone="secondary"
                                numberOfLines={1}
                            >
                                {t(
                                    availabilityLabelKeyByAvailability[
                                        item.availability
                                    ],
                                )}
                            </AppText>
                        </View>
                    </View>
                </View>
            }
        />
    );
};
