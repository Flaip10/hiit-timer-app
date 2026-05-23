import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { Button } from '@src/components/ui/Button/Button';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import {
    useExerciseDefinitions,
    type ExerciseDefinitionListParams,
} from '@src/data/exerciseDefinitions';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { ExerciseDefinitionCard } from './components/ExerciseDefinitionCard/ExerciseDefinitionCard';
import { ExerciseDefinitionFormModal } from './components/ExerciseDefinitionFormModal/ExerciseDefinitionFormModal';
import { useExerciseDefinitionsScreenStyles } from './ExerciseDefinitionsScreen.styles';

const SEARCH_DEBOUNCE_DELAY_MS = 150;

const ExerciseDefinitionsScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const st = useExerciseDefinitionsScreenStyles();

    const [search, setSearch] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const debouncedSearch = useDebouncedValue(
        search.trim(),
        SEARCH_DEBOUNCE_DELAY_MS,
    );

    const listParams = useMemo<ExerciseDefinitionListParams>(
        () => ({
            filters: {
                name: debouncedSearch,
            },
            scope: 'active',
        }),
        [debouncedSearch],
    );
    const { data: list = [] } = useExerciseDefinitions(listParams);
    const hasSearch = debouncedSearch.length > 0;

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
                    <ListEmptyState
                        title={
                            hasSearch
                                ? t('exerciseDefinitions.searchEmptyTitle')
                                : t('exerciseDefinitions.emptyTitle')
                        }
                        description={
                            hasSearch
                                ? t(
                                      'exerciseDefinitions.searchEmptyDescription',
                                  )
                                : t('exerciseDefinitions.emptyDescription')
                        }
                        actionLabel={
                            hasSearch
                                ? undefined
                                : t('exerciseDefinitions.createButton')
                        }
                        onPressAction={hasSearch ? undefined : openModal}
                    />
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
