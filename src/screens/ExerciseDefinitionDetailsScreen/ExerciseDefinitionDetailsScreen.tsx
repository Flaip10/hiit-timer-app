import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { useTheme } from '@src/theme/ThemeProvider';
import { useExerciseDefinition } from '@src/data/exerciseDefinitions';
import { ExerciseDefinitionFormModal } from '@src/screens/ExerciseDefinitionsScreen/components/ExerciseDefinitionFormModal/ExerciseDefinitionFormModal';
import { useExerciseDefinitionDetailsScreenStyles } from './ExerciseDefinitionDetailsScreen.styles';

const sourceLabelKeyBySource = {
    system: 'exerciseDefinitions.source.system',
    user: 'exerciseDefinitions.source.user',
} as const;

const availabilityLabelKeyByAvailability = {
    both: 'exerciseDefinitions.availability.both',
    gym: 'exerciseDefinitions.availability.gym',
    workout: 'exerciseDefinitions.availability.workout',
} as const;

const ExerciseDefinitionDetailsScreen = () => {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const st = useExerciseDefinitionDetailsScreenStyles();
    const { data: definition } = useExerciseDefinition(id);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    if (!id || !definition) {
        return (
            <MainContainer
                title={t('exerciseDefinitions.detailsTitle')}
                scroll={false}
            >
                <View style={st.center}>
                    <AppText variant="body" tone="danger" style={st.errorText}>
                        {t('exerciseDefinitions.notFound')}
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

    const topBarOptions = [
        {
            id: 'edit-exercise-definition',
            label: t('common.actions.edit'),
            icon: 'edit',
            onPress: () => setIsEditModalVisible(true),
        },
    ] as const;

    return (
        <>
            <MainContainer
                title={definition.name}
                gap={0}
                topBarOptions={topBarOptions}
            >
                <ScreenSection
                    title={t('exerciseDefinitions.overview')}
                    topSpacing="small"
                    gap={12}
                >
                    <MetaCard
                        expandable={false}
                        topLeftContent={{
                            text: t(sourceLabelKeyBySource[definition.source]),
                            icon: (
                                <Ionicons
                                    name={
                                        definition.source === 'system'
                                            ? 'sparkles-outline'
                                            : 'person-outline'
                                    }
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
                            <View style={st.overviewContainer}>
                                <View style={st.metricCard}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t('exerciseDefinitions.fields.source')}
                                    </AppText>
                                    <AppText
                                        variant="body"
                                        style={st.metricValue}
                                        numberOfLines={1}
                                    >
                                        {t(
                                            sourceLabelKeyBySource[
                                                definition.source
                                            ],
                                        )}
                                    </AppText>
                                </View>

                                <View style={st.metricCardWide}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t(
                                            'exerciseDefinitions.fields.availability',
                                        )}
                                    </AppText>
                                    <AppText
                                        variant="bodySmall"
                                        style={st.metricValue}
                                        numberOfLines={2}
                                    >
                                        {t(
                                            availabilityLabelKeyByAvailability[
                                                definition.availability
                                            ],
                                        )}
                                    </AppText>
                                </View>
                            </View>
                        }
                    />
                </ScreenSection>
            </MainContainer>

            <ExerciseDefinitionFormModal
                visible={isEditModalVisible}
                definition={definition}
                onClose={() => setIsEditModalVisible(false)}
            />
        </>
    );
};

export default ExerciseDefinitionDetailsScreen;
