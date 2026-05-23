import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Stepper } from '@src/components/ui/Stepper/Stepper';
import { ExerciseCard } from '@components/blocks/ExerciseCard';
import { FooterBar } from '@src/components/layout/FooterBar';
import {
    MainContainer,
    type MainContainerHandle,
} from '@src/components/layout/MainContainer/MainContainer';
import { Button } from '@src/components/ui/Button/Button';
import { TextField } from '@src/components/ui/TextField/TextField';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';

import { useWorkoutDraftStore } from '@src/state/stores/useWorkoutDraftStore';
import { useBlockEditor } from './useBlockEditor';
import { useBlockEditStyles } from './EditBlockScreen.styles';
import { AppText } from '@src/components/ui/Typography/AppText';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import type { BlockValidationError, BlockValidationTargetId } from './helpers';
import { useValidationScroll } from '@src/hooks/useValidationScroll';

const EditBlockScreen = () => {
    const { t } = useTranslation();
    const { blockId, quick } = useLocalSearchParams<{
        blockId?: string;
        quick?: string;
    }>();
    const isQuick = quick === '1' || quick === 'true' || quick === 'yes';
    const router = useRouter();

    const draft = useWorkoutDraftStore((state) => state.draft);
    const updateDraftBlock = useWorkoutDraftStore(
        (state) => state.updateDraftBlock,
    );

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
        null,
    );
    const [dismissalKey, setDismissalKey] = useState(0);
    const mainContainerRef = useRef<MainContainerHandle | null>(null);

    const { refFor, scrollToFirstError } =
        useValidationScroll<BlockValidationTargetId>({
            scrollTargetIntoView: (targetRef, viewportRatio) => {
                mainContainerRef.current?.scrollTargetIntoView(
                    targetRef,
                    viewportRatio,
                );
            },
        });

    const formatValidationError = useCallback(
        (error: BlockValidationError): string => {
            switch (error.key) {
                case 'setsMin':
                    return t('editBlock.validation.setsMin');
                case 'exercisesMin':
                    return t('editBlock.validation.exercisesMin');
                case 'exerciseNameRequired':
                    return t('editBlock.validation.exerciseNameRequired');
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
        [t],
    );

    const getExerciseNameErrorText = useCallback(
        (exerciseId: string): string | undefined => {
            const exerciseNameError = errors.find(
                (error) =>
                    error.key === 'exerciseNameRequired' &&
                    error.targetId === `exercise:${exerciseId}`,
            );

            if (!exerciseNameError) return undefined;
            return formatValidationError(exerciseNameError);
        },
        [errors, formatValidationError],
    );

    const bannerMessage = errors
        .filter((error) => error.key !== 'exerciseNameRequired')
        .map((error) => `• ${formatValidationError(error)}`)
        .join('\n');

    if (notFound || !block || labelIndex === null) {
        return (
            <MainContainer title={t('editBlock.title.edit')} scroll={false}>
                <AppText variant="body" tone="error" style={st.err}>
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
        const validationErrors = validate({
            shouldRequireExerciseNames: !isQuick,
        });
        setDismissalKey((prev) => prev + 1);
        if (validationErrors.length) {
            scrollToFirstError(validationErrors);
            return;
        }

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
                ref={mainContainerRef}
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
                        ref={refFor('setup')}
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
                                label={t(
                                    'editBlock.fields.exerciseDurationSec',
                                )}
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
                                    'editBlock.fields.restBetweenExercisesSec',
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
                            <View key={ex.id} ref={refFor(`exercise:${ex.id}`)}>
                                <ExerciseCard
                                    index={ei}
                                    exercise={ex}
                                    nameErrorText={getExerciseNameErrorText(
                                        ex.id,
                                    )}
                                    onChange={(next) => onExChange(ei, next)}
                                    onRemove={() => setExerciseToRemove(ei)}
                                />
                            </View>
                        ))}
                    </View>

                    <ErrorBanner
                        message={bannerMessage}
                        isDismissible
                        dismissalKey={dismissalKey}
                    />

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
