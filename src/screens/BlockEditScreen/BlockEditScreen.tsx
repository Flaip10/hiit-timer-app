import { useMemo } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Stepper } from '@components/ui/Stepper';
import { ExerciseCard } from '@components/blocks/ExerciseCard';
import { FooterBar } from '@src/components/layout/FooterBar';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { Button } from '@src/components/ui/Button/Button';

import { useWorkouts } from '@state/useWorkouts';
import { useBlockEditor } from './useBlockEditor';
import st from './styles';

const BlockEditScreen = () => {
    const { blockId } = useLocalSearchParams<{ blockId?: string }>();
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

    const errorBox = useMemo(
        () =>
            errors.length ? (
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

    if (notFound || !block) {
        return (
            <MainContainer title="Edit Block" scroll={false}>
                <Text style={st.err}>Block not found.</Text>
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
            router.back();
        } finally {
            setSaving(false);
        }
    };

    const titleSuffix = block.title ? ` — ${block.title}` : '';

    return (
        <>
            <MainContainer title={`Block ${labelIndex}${titleSuffix}`}>
                {/* Title */}
                <Text style={st.label}>Block Title (optional)</Text>
                <TextInput
                    value={block.title ?? ''}
                    onChangeText={onTitle}
                    style={st.input}
                />

                {/* Core scheme */}
                <Stepper
                    label="Sets"
                    value={block.sets}
                    onChange={onSets}
                    min={1}
                />

                <Stepper
                    label="# Exercises"
                    value={block.exercises.length}
                    onChange={onNumExercises}
                    min={1}
                />

                {/* NEW: Global Exercise Duration setter */}
                <Stepper
                    label="Exercise duration (sec)"
                    value={block.exercises[0]?.value ?? 20}
                    onChange={onExerciseLength}
                    min={5}
                    step={5}
                />

                <Stepper
                    label="Rest between sets (sec)"
                    value={block.restBetweenSetsSec}
                    onChange={onRestBetweenSets}
                    min={0}
                    step={5}
                />

                <Stepper
                    label="Rest between exercises (sec)"
                    value={block.restBetweenExercisesSec}
                    onChange={onRestBetweenExercises}
                    min={0}
                    step={5}
                />

                <Text style={st.sectionTitle}>Exercises</Text>
                {block.exercises.map((ex, ei) => (
                    <ExerciseCard
                        key={ex.id}
                        index={ei}
                        exercise={ex}
                        onChange={(next) => onExChange(ei, next)}
                        onRemove={() => onRemoveExercise(ei)}
                    />
                ))}

                <Pressable
                    onPress={onAddExercise}
                    style={({ pressed }) => [
                        st.addMinor,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.addMinorText}>＋ Add Exercise</Text>
                </Pressable>

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
                    title="Save Block"
                    variant="primary"
                    onPress={onSave}
                    loading={saving}
                    flex={1}
                />
            </FooterBar>
        </>
    );
};

export default BlockEditScreen;
