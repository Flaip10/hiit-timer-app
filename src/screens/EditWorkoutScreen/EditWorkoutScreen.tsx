import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TopBar } from '@src/components/navigation/TopBar';
import {
    isRepsPace,
    isTimePace,
    Workout,
    WorkoutBlock,
} from '@src/core/entities';
import { uid } from '@src/core/id';
import { useWorkout, useWorkouts } from '@src/state/useWorkouts';
import st from './styles';

const emptyBlock = (): WorkoutBlock => ({
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
        existing?.blocks ?? [emptyBlock()]
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

    const onAddBlock = () => setBlocks((prev) => [...prev, emptyBlock()]);
    const onRemoveBlock = (index: number) =>
        setBlocks((prev) => prev.filter((_, i) => i !== index));

    // navigation to block-edit
    const onEditBlock = (index: number) => {
        const targetId = existing?.id ?? 'draft';
        router.push(`/workouts/block-edit?id=${targetId}&index=${index}`);
    };

    // validation + save
    const validate = (): boolean => {
        const errs: string[] = [];
        if (!name.trim()) errs.push('Workout name is required.');
        if (blocks.length === 0) errs.push('Add at least one block.');

        blocks.forEach((b, bi) => {
            if (b.scheme.sets <= 0)
                errs.push(`Block ${bi + 1}: sets must be > 0.`);
            if (b.exercises.length === 0)
                errs.push(`Block ${bi + 1}: must have at least one exercise.`);

            if (isTimePace(b.defaultPace) && b.defaultPace.workSec <= 0)
                errs.push(`Block ${bi + 1}: work seconds must be > 0.`);
            if (isRepsPace(b.defaultPace) && b.defaultPace.reps <= 0)
                errs.push(`Block ${bi + 1}: reps must be > 0.`);
        });

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
                // @ts-ignore: add returns ID
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

                {/* ----- Blocks Summary List ----- */}
                <Text style={st.sectionTitle}>Blocks</Text>
                {blocks.map((b, i) => (
                    <View key={b.id} style={st.blockCard}>
                        <View style={st.blockHeader}>
                            <Text style={st.blockTitle}>
                                Block {i + 1} {b.title ? `— ${b.title}` : ''}
                            </Text>
                        </View>

                        <Text style={st.blockInfo}>
                            {b.scheme.sets} sets • {b.exercises.length}{' '}
                            exercises •{' '}
                            {isTimePace(b.defaultPace)
                                ? `${b.defaultPace.workSec}s work`
                                : `${b.defaultPace.reps} reps`}
                        </Text>

                        <View style={st.blockActions}>
                            <Pressable
                                onPress={() => onEditBlock(i)}
                                style={st.smallButton}
                            >
                                <Text style={st.smallText}>Edit</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => onRemoveBlock(i)}
                                style={st.removeButton}
                            >
                                <Text style={st.removeText}>Remove</Text>
                            </Pressable>
                        </View>
                    </View>
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
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [
                            st.secondary,
                            pressed && st.pressed,
                        ]}
                    >
                        <Text style={st.secondaryText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                        disabled={saving}
                        onPress={onSave}
                        style={({ pressed }) => [
                            st.primary,
                            (pressed || saving) && st.pressed,
                        ]}
                    >
                        <Text style={st.primaryText}>
                            {existing ? 'Save' : 'Create'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

export default EditWorkoutScreen;
