import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';
import {
    useExerciseDefinitions,
    type ExerciseDefinitionListParams,
} from '@src/data/exerciseDefinitions';
import { ExerciseDefinitionCard } from './components/ExerciseDefinitionCard/ExerciseDefinitionCard';
import { ExerciseDefinitionFormModal } from './components/ExerciseDefinitionFormModal/ExerciseDefinitionFormModal';
import { useExerciseDefinitionsScreenStyles } from './styles';

interface EmptyExerciseDefinitionsProps {
    onPressButton: () => void;
}

const EmptyExerciseDefinitions = ({
    onPressButton,
}: EmptyExerciseDefinitionsProps) => {
    const { t } = useTranslation();
    const st = useExerciseDefinitionsScreenStyles();

    return (
        <View style={st.emptyContainer}>
            <AppText variant="title3">
                {t('exerciseDefinitions.emptyTitle')}
            </AppText>

            <AppText
                variant="bodySmall"
                tone="secondary"
                style={st.emptyDescription}
            >
                {t('exerciseDefinitions.emptyDescription')}
            </AppText>

            <Button
                title={t('exerciseDefinitions.createButton')}
                variant="primary"
                onPress={onPressButton}
                style={st.emptyButton}
            />
        </View>
    );
};

const ExerciseDefinitionsScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const st = useExerciseDefinitionsScreenStyles();

    const [search, setSearch] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const listParams = useMemo<ExerciseDefinitionListParams>(
        () => ({
            filters: {
                name: search,
            },
            scope: 'active',
        }),
        [search],
    );
    const { data: list = [] } = useExerciseDefinitions(listParams);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <MainContainer
            title={t('exerciseDefinitions.title')}
            scroll={false}
            noPadding
        >
            <FlatList
                data={list}
                keyExtractor={(item) => item.id}
                style={st.list}
                contentContainerStyle={st.listContent}
                ListHeaderComponent={
                    <View style={st.headerContainer}>
                        <View style={st.headerRow}>
                            <SearchField
                                value={search}
                                onChangeText={setSearch}
                                fullWidth
                                placeholder={t(
                                    'exerciseDefinitions.searchPlaceholder',
                                )}
                            />

                            <Button
                                title={t('exerciseDefinitions.newButton')}
                                variant="primary"
                                onPress={openModal}
                                style={st.newButton}
                            />
                        </View>
                    </View>
                }
                stickyHeaderIndices={[0]}
                renderItem={({ item }) => (
                    <ExerciseDefinitionCard
                        item={item}
                        onPress={() =>
                            router.push(`/exercise-definitions/${item.id}`)
                        }
                    />
                )}
                ListEmptyComponent={
                    <EmptyExerciseDefinitions onPressButton={openModal} />
                }
                keyboardShouldPersistTaps="handled"
            />

            <ExerciseDefinitionFormModal
                visible={isModalVisible}
                onClose={closeModal}
            />
        </MainContainer>
    );
};

export default ExerciseDefinitionsScreen;
