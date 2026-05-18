import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { WorkoutBlock } from '@src/core/entities/entities';
import { uid } from '@src/core/id';
import { useWorkoutDraftStore } from '@src/state/stores/useWorkoutDraftStore';
import { useUpsertWorkout, useWorkout } from '@src/data/workouts';

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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const { id, fromImport } = useLocalSearchParams<{
        id?: string;
        fromImport?: string;
    }>();
    const router = useRouter();

    const draft = useWorkoutDraftStore((state) => state.draft);
    const sourceWorkoutVersionId = useWorkoutDraftStore(
        (state) => state.sourceWorkoutVersionId,
    );
    const startDraftNew = useWorkoutDraftStore((state) => state.startDraftNew);
    const startDraftFromWorkout = useWorkoutDraftStore(
        (state) => state.startDraftFromWorkout,
    );
    const updateDraftMeta = useWorkoutDraftStore(
        (state) => state.updateDraftMeta,
    );
    const setDraftBlocks = useWorkoutDraftStore(
        (state) => state.setDraftBlocks,
    );
    const buildWorkoutFromDraft = useWorkoutDraftStore(
        (state) => state.buildWorkoutFromDraft,
    );
    const clearDraft = useWorkoutDraftStore((state) => state.clearDraft);
    const { data: savedWorkout } = useWorkout(id);
    const upsertWorkout = useUpsertWorkout();

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<WorkoutEditError[]>([]);
    const [blockToRemove, setBlockToRemove] = useState<string | null>(null);

    const { theme } = useTheme();

    // initialise / cleanup draft
    useEffect(() => {
        // If we are importing, DO NOT touch the draft.
        if (fromImport === '1') return;
        if (draft) return;

        if (id) {
            if (savedWorkout) {
                startDraftFromWorkout(savedWorkout);
            }
            return;
        } else {
            startDraftNew();
        }
    }, [
        draft,
        id,
        fromImport,
        savedWorkout,
        startDraftFromWorkout,
        startDraftNew,
    ]);

    useEffect(() => {
        if (fromImport === '1') return;

        return () => {
            clearDraft();
        };
    }, [clearDraft, fromImport]);

    const name = draft?.name ?? t('editWorkout.defaults.newWorkout');
    const blocks = draft?.blocks ?? [];

    const onAddBlock = () => {
        if (!draft) return;

        setDraftBlocks([...draft.blocks, createEmptyBlock()]);
        setErrors((prev) => prev.filter((e) => e.field !== 'blocks'));
    };

    const onEditBlock = (blockId: string) => {
        router.push({
            pathname: '/workouts/edit-block',
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
                message: t('editWorkout.validation.nameRequired'),
            });
        }
        if (blocks.length === 0) {
            errs.push({
                field: 'blocks',
                message: t('editWorkout.validation.addBlock'),
            });
        }
        const hasUnnamedExercise = blocks.some((block) =>
            block.exercises.some((exercise) => {
                const hasDefinition = !!exercise.exerciseDefinitionId;
                const hasName =
                    exercise.name !== undefined &&
                    exercise.name.trim().length > 0;

                return !hasDefinition && !hasName;
            })
        );
        if (hasUnnamedExercise) {
            errs.push({
                field: 'exercises',
                message: t('editWorkout.validation.exerciseNamesRequired'),
            });
        }
        setErrors(errs);
        return errs.length === 0;
    };

    const isEditingSavedWorkout = !!id;

    const onSave = async () => {
        if (saving) return;
        if (!draft) return;
        if (!validate()) return;

        setSaving(true);
        try {
            const workout = buildWorkoutFromDraft();
            if (!workout) return;

            await upsertWorkout.mutateAsync({
                workout,
                sourceWorkoutVersionId: sourceWorkoutVersionId ?? undefined,
            });
            clearDraft();

            if (isEditingSavedWorkout) {
                router.back();
            } else {
                router.replace(`/workouts/${workout.id}`);
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
                title={
                    isEditingSavedWorkout
                        ? t('editWorkout.title.edit')
                        : t('editWorkout.title.create')
                }
                gap={theme.layout.mainContainer.gap}
            >
                <TextField
                    label={t('editWorkout.fields.name')}
                    value={name}
                    onChangeText={(value) => {
                        updateDraftMeta({ name: value });
                        // Clear only 'name' errors when user edits the name
                        setErrors((prev) =>
                            prev.filter((e) => e.field !== 'name'),
                        );
                    }}
                    placeholder={t('editWorkout.fields.namePlaceholder')}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                    errorText={nameError?.message}
                />

                <ScreenSection
                    title={t('editWorkout.sections.blocks')}
                    gap={theme.layout.listItem.gap}
                >
                    <AppText variant="caption" tone="secondary">
                        {t('editWorkout.hints.tapBlockToEdit')}
                    </AppText>

                    <ErrorBanner message={bannerMessage} />

                    {blocks.map((block, index) => (
                        <WorkoutBlockItem
                            key={block.id}
                            block={block}
                            index={index}
                            onPress={onEditBlock}
                            onRemove={setBlockToRemove}
                            initiallyExpanded
                            isWiggling={true}
                        />
                    ))}

                    <Button
                        title={t('editWorkout.actions.addBlock')}
                        onPress={onAddBlock}
                        variant="secondary"
                    />
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title={t('editWorkout.actions.cancel')}
                    variant="secondary"
                    onPress={() => router.back()}
                    flex={1}
                />
                <Button
                    title={
                        isEditingSavedWorkout
                            ? t('editWorkout.actions.save')
                            : t('editWorkout.actions.create')
                    }
                    variant="primary"
                    onPress={onSave}
                    loading={saving}
                    flex={1}
                />
            </FooterBar>

            <ConfirmDialog
                visible={blockToRemove != null}
                title={t('editWorkout.removeBlock.title')}
                message={t('editWorkout.removeBlock.message')}
                confirmLabel={t('editWorkout.removeBlock.confirm')}
                cancelLabel={t('editWorkout.removeBlock.cancel')}
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
