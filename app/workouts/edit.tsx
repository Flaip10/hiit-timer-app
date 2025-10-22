import { useEffect, useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useWorkout, useWorkouts } from '../../src/state/useWorkouts';
import type { Workout, WorkoutBlock } from '../../src/core/entities';
import { BlockSummary } from '../../src/components/blocks/BlockSummary';
import { uid } from '../../src/core/id';
import {
    setDraftBlocks,
    getDraftBlocks,
    clearDraftBlocks,
} from '../../src/state/editCache';

const emptyBlock = (): WorkoutBlock => ({
    id: uid(),
    title: '',
    defaultPace: { type: 'time', workSec: 20 },
    scheme: { sets: 3, restBetweenSetsSec: 30, restBetweenExercisesSec: 10 },
    advanced: false,
    exercises: [{ id: uid(), name: 'Exercise 1' }],
});

// If editing existing, you’ll push here with /workouts/edit?id=...
// For brevity, we treat this as a “new” editor (no params); adjust if you need deep-linking edit by id.
const EditWorkoutScreen = () => {
    const existingId = undefined as unknown as string | undefined; // keep simple; your list -> “Edit” goes to /workouts/edit?id=...
    const existing = useWorkout(existingId);
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

    // When we return from /workouts/block-edit (draft mode), pull back the edited blocks
    useFocusEffect(
        useMemo(() => {
            const applyDraft = () => {
                const draft = getDraftBlocks();
                if (draft) setBlocks(draft);
            };
            applyDraft();
            return () => {};
        }, [])
    );

    const onAddBlock = () => setBlocks((prev) => [...prev, emptyBlock()]);
    const onRemoveBlock = (bi: number) =>
        setBlocks((prev) => prev.filter((_, i) => i !== bi));

    const validate = (): boolean => {
        const errs: string[] = [];
        if (!name.trim()) errs.push('Name is required.');
        if (blocks.length === 0) errs.push('Add at least one block.');
        blocks.forEach((b, i) => {
            if (b.scheme.sets <= 0)
                errs.push(`Block ${i + 1}: sets must be > 0.`);
            if (b.exercises.length <= 0)
                errs.push(`Block ${i + 1}: add at least one exercise.`);
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
                update(existing.id, {
                    name: payload.name,
                    blocks: payload.blocks,
                });
                clearDraftBlocks();
                router.replace(`/workouts/${existing.id}`);
            } else {
                // @ts-ignore add returns id in our store
                const addedId: string = (await add(payload)) ?? payload.id;
                clearDraftBlocks();
                router.replace(`/workouts/${addedId}`);
            }
        } finally {
            setSaving(false);
        }
    };

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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={st.container}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={st.h1}>
                    {existing ? 'Edit Workout' : 'New Workout'}
                </Text>

                <Text style={st.label}>Name</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Conditioning B"
                    placeholderTextColor="#6B7280"
                    style={st.input}
                />

                {blocks.map((b, bi) => (
                    <View key={b.id} style={st.block}>
                        <BlockSummary block={b} index={bi} />
                        <View style={st.blockActions}>
                            <Pressable
                                onPress={() => onRemoveBlock(bi)}
                                style={({ pressed }) => [
                                    st.removeSmall,
                                    pressed && st.pressed,
                                ]}
                            >
                                <Text style={st.removeSmallText}>Remove</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    // seed draft with the current blocks, then jump to block editor in “draft” mode
                                    setDraftBlocks(blocks);
                                    router.push({
                                        pathname: '/workouts/block-edit',
                                        params: {
                                            id: 'draft',
                                            index: String(bi),
                                        },
                                    });
                                }}
                                style={({ pressed }) => [
                                    st.smallBtn,
                                    pressed && st.pressed,
                                ]}
                            >
                                <Text style={st.smallBtnText}>Edit</Text>
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
        </KeyboardAvoidingView>
    );
};

const st = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#0B0B0C',
        padding: 16,
        gap: 12,
        paddingBottom: 40,
    },
    h1: { color: '#F2F2F2', fontSize: 24, fontWeight: '700', marginBottom: 4 },
    label: { color: '#A1A1AA', marginBottom: 6 },
    input: {
        backgroundColor: '#131316',
        color: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
    },

    block: {
        backgroundColor: '#111113',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 12,
        gap: 8,
        marginTop: 12,
    },
    blockActions: { flexDirection: 'row', gap: 8, alignSelf: 'flex-end' },

    addBlock: {
        backgroundColor: '#1C1C1F',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
    },
    addBlockText: { color: '#E5E7EB', fontWeight: '700' },

    smallBtn: {
        backgroundColor: '#1C1C1F',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    smallBtnText: { color: '#E5E7EB', fontWeight: '700' },
    removeSmall: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#3B0D0D',
        borderWidth: 1,
        borderColor: '#7F1D1D',
    },
    removeSmallText: { color: '#FCA5A5', fontWeight: '700' },

    footer: { flexDirection: 'row', gap: 10, marginTop: 16, paddingBottom: 24 },
    primary: {
        flex: 1,
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    secondary: {
        flex: 1,
        backgroundColor: '#1C1C1F',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryText: { color: '#E5E7EB', fontWeight: '700' },

    pressed: { opacity: 0.9 },

    errorBox: {
        backgroundColor: '#2A0E0E',
        borderColor: '#7F1D1D',
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        marginTop: 8,
        gap: 4,
    },
    errorText: { color: '#FCA5A5' },
});

export default EditWorkoutScreen;
