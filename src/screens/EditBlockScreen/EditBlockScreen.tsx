import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Stepper } from '@src/components/ui/Stepper/Stepper';
import { ExerciseCard } from '@components/blocks/ExerciseCard';
import { FooterBar } from '@src/components/layout/FooterBar';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { Button } from '@src/components/ui/Button/Button';
import { TextField } from '@src/components/ui/TextField/TextField';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';

import { useWorkouts } from '@state/useWorkouts';
import { useBlockEditor } from './useBlockEditor';
import { useBlockEditStyles } from './EditBlockScreen.styles';
import { AppText } from '@src/components/ui/Typography/AppText';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import type { BlockValidationError } from './helpers';

const EditBlockScreen = () => {
    const { t } = useTranslation();
    const { blockId, quick } = useLocalSearchParams<{
        blockId?: string;
        quick?: string;
    }>();
    const isQuick = quick === '1' || quick === 'true' || quick === 'yes';
    const router = useRouter();

    const draft = useWorkouts((state) => state.draft);
    const updateDraftBlock = useWorkouts((state) => state.updateDraftBlock);

    const {
        block,
        labelIndex,
        notFound,
        errors,
        saving,
        setSaving,
        onTitle,
        onSets,
        onRestBetweenSets,
        onRestBetweenExercises,
        onNumExercises,
        onExerciseLength,
        onExChange,
        onAddExercise,
        onRemoveExercise,
        validate,
    } = useBlockEditor({ draft, blockId });

    const st = useBlockEditStyles();
    const [exerciseToRemove, setExerciseToRemove] = useState<number | null>(
        null
    );

    const formatValidationError = useCallback(
        (error: BlockValidationError): string => {
            switch (error.key) {
                case 'setsMin':
                    return t('editBlock.validation.setsMin');
                case 'exercisesMin':
                    return t('editBlock.validation.exercisesMin');
                case 'exerciseDurationMin':
                    return t('editBlock.validation.exerciseDurationMin', {
                        index: error.exerciseIndex ?? 1,
                    });
                case 'exerciseRepsMin':
                    return t('editBlock.validation.exerciseRepsMin', {
                        index: error.exerciseIndex ?? 1,
                    });
            }
        },
        [t]
    );

    const errorBox = useMemo(
        () =>
            errors.length ? (
                <View style={st.errorBox}>
                    {errors.map((e, i) => (
                        <AppText key={i} variant="bodySmall" tone="danger">
                            • {formatValidationError(e)}
                        </AppText>
                    ))}
                </View>
            ) : null,
        [errors, formatValidationError, st.errorBox]
    );

    if (notFound || !block || labelIndex === null) {
        return (
            <MainContainer title={t('editBlock.title.edit')} scroll={false}>
                <AppText variant="body" tone="danger" style={st.err}>
                    {t('editBlock.notFound')}
                </AppText>
                <Button
                    title={t('common.actions.back')}
                    onPress={() => router.back()}
                />
            </MainContainer>
        );
    }

    const onSave = () => {
        if (saving) return;
        if (!validate()) return;

        setSaving(true);
        try {
            updateDraftBlock(block.id, block);

            if (isQuick) {
                // go straight to run using the draft (no workout id)
                router.push('/run?mode=quick&autoStart=1');
                return;
            }

            router.back();
        } finally {
            setSaving(false);
        }
    };

    const blockLabel = t('common.labels.blockWithIndex', {
        index: labelIndex,
    });

    return (
        <>
            <MainContainer
                title={
                    isQuick
                        ? t('editBlock.title.quick')
                        : t('editBlock.title.edit')
                }
            >
                {/* Block setup section */}
                <ScreenSection
                    title={t('editBlock.sections.setup')}
                    topSpacing="none"
                    gap={18}
                >
                    <TextField
                        label={t('editBlock.fields.blockTitle')}
                        value={block.title ?? ''}
                        onChangeText={onTitle}
                        placeholder={blockLabel}
                    />

                    <Stepper
                        label={t('editBlock.fields.setsInBlock')}
                        labelTone="primary"
                        value={block.sets}
                        onChange={onSets}
                        formatValue={(next) =>
                            t('common.units.set', { count: next })
                        }
                        min={1}
                    />

                    <View style={[st.setupGroup, st.setupGroupCard]}>
                        <AppText
                            variant="bodySmall"
                            tone="primary"
                            style={st.setupGroupLegend}
                        >
                            {t('editBlock.sections.structure')}
                        </AppText>

                        <View style={st.setupGroupBody}>
                            <Stepper
                                value={block.exercises.length}
                                onChange={onNumExercises}
                                formatValue={(next) =>
                                    t('common.units.exercise', { count: next })
                                }
                                min={1}
                            />

                            <Stepper
                                label={t('editBlock.fields.exerciseDurationSec')}
                                labelTone="primary"
                                value={block.exercises[0]?.value ?? 20}
                                onChange={onExerciseLength}
                                formatValue={(next) =>
                                    `${next} ${t('editBlock.units.secondsShort')}`
                                }
                                min={5}
                                step={5}
                            />
                        </View>
                    </View>

                    <View style={[st.setupGroup, st.setupGroupCard]}>
                        <AppText
                            variant="bodySmall"
                            tone="primary"
                            style={st.setupGroupLegend}
                        >
                            {t('editBlock.sections.timing')}
                        </AppText>

                        <View style={st.setupGroupBody}>
                            <Stepper
                                label={t(
                                    'editBlock.fields.restBetweenExercisesSec'
                                )}
                                labelTone="primary"
                                value={block.restBetweenExercisesSec}
                                onChange={onRestBetweenExercises}
                                formatValue={(next) =>
                                    `${next} ${t('editBlock.units.secondsShort')}`
                                }
                                min={0}
                                step={5}
                            />

                            <Stepper
                                label={t('editBlock.fields.restBetweenSetsSec')}
                                labelTone="primary"
                                value={block.restBetweenSetsSec}
                                onChange={onRestBetweenSets}
                                formatValue={(next) =>
                                    `${next} ${t('editBlock.units.secondsShort')}`
                                }
                                min={0}
                                step={5}
                            />
                        </View>
                    </View>
                </ScreenSection>
                {/* Exercises section */}
                <ScreenSection
                    title={t('editBlock.sections.exercises')}
                    topSpacing="large"
                >
                    <View style={st.exercisesGap}>
                        {block.exercises.map((ex, ei) => (
                            <ExerciseCard
                                key={ex.id}
                                index={ei}
                                exercise={ex}
                                onChange={(next) => onExChange(ei, next)}
                                onRemove={() => setExerciseToRemove(ei)}
                            />
                        ))}
                    </View>

                    {errorBox}

                    <Button
                        title={t('editBlock.actions.addExercise')}
                        onPress={onAddExercise}
                        variant="secondary"
                    />
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title={t('editBlock.actions.cancel')}
                    variant="secondary"
                    onPress={() => router.back()}
                    flex={1}
                />
                <Button
                    title={
                        isQuick
                            ? t('editBlock.actions.startWorkout')
                            : t('editBlock.actions.saveBlock')
                    }
                    variant="primary"
                    onPress={onSave}
                    loading={saving}
                    flex={1}
                />
            </FooterBar>

            <ConfirmDialog
                visible={exerciseToRemove !== null}
                title={t('editBlock.removeExercise.title')}
                message={t('editBlock.removeExercise.message')}
                confirmLabel={t('editBlock.removeExercise.confirm')}
                cancelLabel={t('editBlock.removeExercise.cancel')}
                destructive
                onConfirm={() => {
                    if (exerciseToRemove !== null) {
                        onRemoveExercise(exerciseToRemove);
                    }
                    setExerciseToRemove(null);
                }}
                onCancel={() => setExerciseToRemove(null)}
            />
        </>
    );
};

export default EditBlockScreen;
