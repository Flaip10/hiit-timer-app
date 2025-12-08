import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { WorkoutBlock } from '@src/core/entities';
import { uid } from '@src/core/id';
import { useWorkouts } from '@src/state/useWorkouts';

import { WorkoutBlockItem } from './components/WorkoutBlockItem/WorkoutBlockItem';
import { Button } from '@src/components/ui/Button/Button';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { TextField } from '@src/components/ui/TextField/TextField';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { AppText } from '@src/components/ui/Typography/AppText';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { useTheme } from '@src/theme/ThemeProvider';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import {
    getFieldError,
    formatErrorList,
} from '@src/core/validation/formErrors';
import type { WorkoutEditError } from './EditWorkoutScreen.interfaces';

const createEmptyBlock = (): WorkoutBlock => ({
    id: uid(),
    title: '',
    sets: 3,
    restBetweenSetsSec: 30,
    restBetweenExercisesSec: 10,
    exercises: [
        {
            id: uid(),
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
    const [errors, setErrors] = useState<WorkoutEditError[]>([]);
    const [blockToRemove, setBlockToRemove] = useState<string | null>(null);

    const { theme } = useTheme();

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
        setErrors((prev) => prev.filter((e) => e.field !== 'blocks'));
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
        const trimmedName = name.trim();

        const errs: WorkoutEditError[] = [];
        if (!trimmedName) {
            errs.push({
                field: 'name',
                message: 'Workout name is required.',
            });
        }
        if (blocks.length === 0) {
            errs.push({
                field: 'blocks',
                message: 'Add at least one block.',
            });
        }
        setErrors(errs);
        return errs.length === 0;
    };

    const isEditingExisting = !!id;

    const onSave = () => {
        if (saving) return;
        if (!draft) return;
        if (!validate()) return;

        setSaving(true);
        try {
            const idFromCommit = commitDraft();

            if (isEditingExisting) {
                router.back();
            } else {
                if (idFromCommit) {
                    router.replace(`/workouts/${idFromCommit}`);
                } else {
                    // Fallback – something went wrong, just go back.
                    router.back();
                }
            }
        } finally {
            setSaving(false);
        }
    };

    const nameError = getFieldError(errors, 'name');

    const nonNameErrors = errors.filter((e) => e.field !== 'name');
    const bannerMessage = formatErrorList(nonNameErrors);

    return (
        <>
            <MainContainer
                title={isEditingExisting ? 'Edit Workout' : 'New Workout'}
                gap={theme.layout.mainContainer.gap}
            >
                <TextField
                    label="Name"
                    value={name}
                    onChangeText={(value) => {
                        updateDraftMeta({ name: value ?? '' });
                        // Clear only 'name' errors when user edits the name
                        setErrors((prev) =>
                            prev.filter((e) => e.field !== 'name')
                        );
                    }}
                    placeholder="e.g., Conditioning A"
                    autoCapitalize="sentences"
                    returnKeyType="done"
                    errorText={nameError?.message}
                />

                <ScreenSection title="Blocks" gap={theme.layout.listItem.gap}>
                    <AppText variant="caption" tone="secondary">
                        Tap a block to edit its details.
                    </AppText>

                    <ErrorBanner message={bannerMessage} />

                    {blocks.map((block, index) => (
                        <WorkoutBlockItem
                            key={block.id}
                            block={block}
                            index={index}
                            onPress={onEditBlock}
                            onRemove={setBlockToRemove}
                        />
                    ))}

                    <Button
                        title="＋ Add Block"
                        onPress={onAddBlock}
                        variant="secondary"
                    />
                </ScreenSection>
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

            <ConfirmDialog
                visible={blockToRemove != null}
                title="Remove block"
                message="This will permanently delete the block from this workout."
                confirmLabel="Remove"
                cancelLabel="Cancel"
                destructive
                onConfirm={() => {
                    if (blockToRemove) {
                        onRemoveBlock(blockToRemove);
                    }
                    setBlockToRemove(null);
                }}
                onCancel={() => setBlockToRemove(null)}
            />
        </>
    );
};

export default EditWorkoutScreen;
