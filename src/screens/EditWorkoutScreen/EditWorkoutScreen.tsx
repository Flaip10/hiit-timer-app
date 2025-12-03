import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { WorkoutBlock } from '@src/core/entities';
import { uid } from '@src/core/id';
import { useWorkouts } from '@src/state/useWorkouts';
import { WorkoutBlockItem } from './WorkoutBlockItem';
import st from './styles';
import { Button } from '@src/components/ui/Button/Button';
import { MainContainer } from '@src/components/layout/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';

const createEmptyBlock = (): WorkoutBlock => ({
    id: uid(),
    title: '',
    sets: 3,
    restBetweenSetsSec: 30,
    restBetweenExercisesSec: 10,
    exercises: [
        {
            id: uid(),
            name: 'Exercise 1',
            mode: 'time',
            value: 20,
        },
    ],
});

const EditWorkoutScreen = () => {
    const { id, importing } = useLocalSearchParams<{
        id?: string;
        importing?: string;
    }>();
    const router = useRouter();

    const draft = useWorkouts((state) => state.draft);
    const startDraftNew = useWorkouts((state) => state.startDraftNew);
    const startDraftFromExisting = useWorkouts(
        (state) => state.startDraftFromExisting
    );
    const updateDraftMeta = useWorkouts((state) => state.updateDraftMeta);
    const setDraftBlocks = useWorkouts((state) => state.setDraftBlocks);
    const commitDraft = useWorkouts((state) => state.commitDraft);
    const clearDraft = useWorkouts((state) => state.clearDraft);

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // initialise / cleanup draft
    useEffect(() => {
        // If we are importing, DO NOT touch the draft.
        if (importing === '1') return;

        if (id) {
            startDraftFromExisting(id);
        } else {
            startDraftNew();
        }

        return () => {
            clearDraft();
        };
    }, [clearDraft, id, importing, startDraftFromExisting, startDraftNew]);

    const name = draft?.name ?? 'New Workout';
    const blocks = draft?.blocks ?? [];

    const onAddBlock = () => {
        if (!draft) return;
        setDraftBlocks([...(draft.blocks ?? []), createEmptyBlock()]);
    };

    const onEditBlock = (blockId: string) => {
        router.push({
            pathname: '/workouts/block-edit',
            params: { blockId },
        });
    };

    const onRemoveBlock = (blockId: string) => {
        if (!draft) return;
        const next = draft.blocks.filter((b) => b.id !== blockId);
        setDraftBlocks(next);
    };

    const validate = (): boolean => {
        const errs: string[] = [];
        const trimmedName = name.trim();

        if (!trimmedName) errs.push('Workout name is required.');
        if (blocks.length === 0) errs.push('Add at least one block.');

        setErrors(errs);
        return errs.length === 0;
    };

    const onSave = () => {
        if (saving) return;
        if (!draft) return;
        if (!validate()) return;

        setSaving(true);
        try {
            const idFromCommit = commitDraft();
            if (idFromCommit) {
                router.replace(`/workouts/${idFromCommit}`);
            } else {
                router.back();
            }
        } finally {
            setSaving(false);
        }
    };

    const errorBox = useMemo(
        () =>
            errors.length > 0 ? (
                <View style={st.errorBox}>
                    {errors.map((e, i) => (
                        <Text key={i} style={st.errorText}>
                            • {e}
                        </Text>
                    ))}
                </View>
            ) : null,
        [errors]
    );

    const isEditingExisting = !!id;

    return (
        <>
            <MainContainer
                title={isEditingExisting ? 'Edit Workout' : 'New Workout'}
            >
                <Text style={st.label}>Workout Name</Text>
                <TextInput
                    value={name}
                    onChangeText={(value) =>
                        updateDraftMeta({ name: value ?? '' })
                    }
                    placeholder="e.g., Conditioning A"
                    placeholderTextColor="#6B7280"
                    style={st.input}
                />

                <Text style={st.sectionTitle}>Blocks</Text>
                {blocks.map((block, index) => (
                    <WorkoutBlockItem
                        key={block.id}
                        block={block}
                        index={index}
                        onEdit={onEditBlock}
                        onRemove={onRemoveBlock}
                    />
                ))}

                <Button
                    title="＋ Add Block"
                    onPress={onAddBlock}
                    style={st.addBlock}
                />

                {errorBox}
            </MainContainer>

            <FooterBar>
                <Button
                    title="Cancel"
                    variant="secondary"
                    onPress={() => router.back()}
                    flex={1}
                />
                <Button
                    title={isEditingExisting ? 'Save' : 'Create'}
                    variant="primary"
                    onPress={onSave}
                    loading={saving}
                    flex={1}
                />
            </FooterBar>
        </>
    );
};

export default EditWorkoutScreen;
