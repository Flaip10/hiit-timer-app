import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TopBar } from '@src/components/navigation/TopBar';
import { Workout, WorkoutBlock } from '@src/core/entities';
import { uid } from '@src/core/id';
import { useWorkout, useWorkouts } from '@src/state/useWorkouts';
import { WorkoutBlockItem } from './WorkoutBlockItem';
import st from './styles';
import { Button } from '@src/components/ui/Button/Button';

const createEmptyBlock = (): WorkoutBlock => ({
    id: uid(),
    title: '',
    defaultPace: { type: 'time', workSec: 20 },
    scheme: { sets: 3, restBetweenSetsSec: 30, restBetweenExercisesSec: 10 },
    advanced: false,
    exercises: [{ id: uid(), name: 'Exercise 1' }],
});

const EditWorkoutScreen = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const existing = useWorkout(id);
    const { add, update } = useWorkouts();
    const router = useRouter();

    const [name, setName] = useState(existing?.name ?? 'New Workout');
    const [blocks, setBlocks] = useState<WorkoutBlock[]>(
        existing?.blocks ?? [createEmptyBlock()]
    );
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (existing) {
            setName(existing.name || 'New Workout');
            setBlocks(
                JSON.parse(JSON.stringify(existing.blocks)) as WorkoutBlock[]
            );
        }
    }, [existing]);

    const onAddBlock = () => setBlocks((prev) => [...prev, createEmptyBlock()]);

    const onRemoveBlock = (index: number) =>
        setBlocks((prev) => prev.filter((_, i) => i !== index));

    const onEditBlock = (index: number) => {
        const targetId = existing?.id ?? 'draft';

        router.push(`/workouts/block-edit?id=${targetId}&index=${index}`);
    };

    const validate = (): boolean => {
        const errs: string[] = [];
        if (!name.trim()) errs.push('Workout name is required.');
        if (blocks.length === 0) errs.push('Add at least one block.');

        setErrors(errs);
        return errs.length === 0;
    };

    const onSave = async () => {
        if (saving) return;
        if (!validate()) return;
        setSaving(true);
        try {
            const payload: Workout = {
                id: existing?.id ?? uid(),
                name: name.trim(),
                blocks,
            };
            if (existing?.id) {
                update(existing.id, payload);
                router.replace(`/workouts/${existing.id}`);
            } else {
                const addedId: string = (await add(payload)) ?? payload.id;
                router.replace(`/workouts/${addedId}`);
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

    return (
        <View style={st.container}>
            <TopBar title={existing ? 'Edit Workout' : 'New Workout'} />
            <ScrollView contentContainerStyle={st.content}>
                <Text style={st.label}>Workout Name</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Conditioning A"
                    placeholderTextColor="#6B7280"
                    style={st.input}
                />

                <Text style={st.sectionTitle}>Blocks</Text>
                {blocks.map((block, index) => (
                    <WorkoutBlockItem
                        key={block.id}
                        index={index}
                        block={block}
                        onEdit={onEditBlock}
                        onRemove={onRemoveBlock}
                    />
                ))}

                <Pressable
                    onPress={onAddBlock}
                    style={({ pressed }) => [
                        st.addBlock,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.addBlockText}>＋ Add Block</Text>
                </Pressable>

                {errorBox}

                <View style={st.footer}>
                    <Button
                        title="Cancel"
                        variant="secondary"
                        onPress={() => router.back()}
                        flex={1}
                    />
                    <Button
                        title={existing ? 'Save' : 'Create'}
                        onPress={onSave}
                        loading={saving}
                        flex={1}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default EditWorkoutScreen;
