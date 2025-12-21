import { useMemo, useState } from 'react';
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
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';

const EditBlockScreen = () => {
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

    const errorBox = useMemo(
        () =>
            errors.length ? (
                <View style={st.errorBox}>
                    {errors.map((e, i) => (
                        <AppText key={i} variant="bodySmall" tone="danger">
                            • {e}
                        </AppText>
                    ))}
                </View>
            ) : null,
        [errors, st.errorBox]
    );

    if (notFound || !block || labelIndex === null) {
        return (
            <MainContainer title="Edit Block" scroll={false}>
                <AppText variant="body" tone="danger" style={st.err}>
                    Block not found.
                </AppText>
                <Button title="Back" onPress={() => router.back()} />
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

    const blockLabel = `Block ${labelIndex}`;

    return (
        <>
            <MainContainer title={isQuick ? 'Quick Workout' : 'Edit Block'}>
                {/* Block setup section */}
                <ScreenSection title="Block setup" topSpacing="none">
                    <View style={st.sectionContentGap}>
                        <TextField
                            label="Block title"
                            value={block.title ?? ''}
                            onChangeText={onTitle}
                            placeholder={blockLabel}
                        />

                        <Stepper
                            label="Exercises in block"
                            value={block.exercises.length}
                            onChange={onNumExercises}
                            min={1}
                        />
                        {/* Global Exercise Duration setter */}
                        <Stepper
                            label="Exercise duration (s)"
                            value={block.exercises[0]?.value ?? 20}
                            onChange={onExerciseLength}
                            min={5}
                            step={5}
                        />

                        <Stepper
                            label="Rest between exercises (s)"
                            value={block.restBetweenExercisesSec}
                            onChange={onRestBetweenExercises}
                            min={0}
                            step={5}
                        />

                        <Stepper
                            label="Sets in block"
                            value={block.sets}
                            onChange={onSets}
                            min={1}
                        />

                        <Stepper
                            label="Rest between sets (s)"
                            value={block.restBetweenSetsSec}
                            onChange={onRestBetweenSets}
                            min={0}
                            step={5}
                        />
                    </View>
                </ScreenSection>
                {/* Exercises section */}
                <ScreenSection
                    title="Exercises"
                    topSpacing="large"
                    rightAccessory={
                        <GuardedPressable
                            onPress={onAddExercise}
                            style={({ pressed }) => [
                                st.addMinor,
                                pressed && st.pressed,
                            ]}
                        >
                            <AppText variant="bodySmall" tone="primary">
                                ＋ Add Exercise
                            </AppText>
                        </GuardedPressable>
                    }
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
                    title={isQuick ? 'Start Workout' : 'Save Block'}
                    variant="primary"
                    onPress={onSave}
                    loading={saving}
                    flex={1}
                />
            </FooterBar>

            <ConfirmDialog
                visible={exerciseToRemove !== null}
                title="Remove exercise"
                message="This will remove the exercise from this block."
                confirmLabel="Remove"
                cancelLabel="Cancel"
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
