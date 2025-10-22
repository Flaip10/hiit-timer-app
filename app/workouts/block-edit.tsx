// app/workouts/block-edit.tsx
import { useEffect, useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkout, useWorkouts } from '../../src/state/useWorkouts';
import type { WorkoutBlock, TimePace, RepsPace } from '../../src/core/entities';
import { isTimePace, isRepsPace } from '../../src/core/entities';
import { ExerciseCard } from '../../src/components/blocks/ExerciseCard';
import { uid } from '../../src/core/id';
import { getDraftBlocks, updateDraftBlock } from '../../src/state/editCache';
import { Stepper } from '../../src/components/ui/Stepper';

const ensureExerciseCount = (
    block: WorkoutBlock,
    count: number
): WorkoutBlock => {
    const next: WorkoutBlock = { ...block, exercises: [...block.exercises] };
    while (next.exercises.length < count)
        next.exercises.push({
            id: uid(),
            name: `Exercise ${next.exercises.length + 1}`,
        });
    while (next.exercises.length > count) next.exercises.pop();
    return next;
};

const clearOverrides = (block: WorkoutBlock): WorkoutBlock => ({
    ...block,
    advanced: false,
    exercises: block.exercises.map((e) => ({ id: e.id, name: e.name })),
});

const BlockEditScreen = () => {
    const { id, index } = useLocalSearchParams<{ id: string; index: string }>();
    const router = useRouter();
    const workout = useWorkout(id);
    const { update } = useWorkouts();

    const bi = Number(index ?? '-1');

    const initialBlock: WorkoutBlock | null =
        id === 'draft'
            ? (getDraftBlocks()?.[bi] ?? null)
            : (workout?.blocks?.[bi] ?? null);

    const [block, setBlock] = useState<WorkoutBlock | null>(initialBlock);
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id === 'draft') {
            const draft = getDraftBlocks();
            if (draft && draft[bi])
                setBlock(JSON.parse(JSON.stringify(draft[bi])) as WorkoutBlock);
        } else if (workout?.blocks?.[bi]) {
            setBlock(
                JSON.parse(JSON.stringify(workout.blocks[bi])) as WorkoutBlock
            );
        }
    }, [id, workout, bi]);

    const validLength =
        id === 'draft'
            ? (getDraftBlocks()?.length ?? 0)
            : (workout?.blocks.length ?? 0);
    if (block == null || Number.isNaN(bi) || bi < 0 || bi >= validLength) {
        return (
            <View style={st.container}>
                <Text style={st.h1}>Block not found</Text>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                        st.secondary,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.secondaryText}>Back</Text>
                </Pressable>
            </View>
        );
    }

    const setField = <K extends keyof WorkoutBlock>(
        key: K,
        value: WorkoutBlock[K]
    ) => setBlock((prev) => (prev ? { ...prev, [key]: value } : prev));

    // block-level handlers
    const onTitle = (v: string) => setField('title', v);
    const onSetsNum = (n: number) =>
        setField('scheme', { ...block.scheme, sets: n });
    const onRestSetNum = (n: number) =>
        setField('scheme', { ...block.scheme, restBetweenSetsSec: n });
    const onRestExNum = (n: number) =>
        setField('scheme', { ...block.scheme, restBetweenExercisesSec: n });
    const onNumExercisesNum = (n: number) =>
        setBlock((prev) =>
            prev ? ensureExerciseCount(prev, Math.max(0, n)) : prev
        );

    // advanced toggle
    const onToggleAdvanced = (enabled: boolean) => {
        if (!enabled)
            return setBlock((prev) => (prev ? clearOverrides(prev) : prev));
        const init =
            block.defaultPace.type === 'time'
                ? ({
                      type: 'time',
                      workSec: (block.defaultPace as TimePace).workSec,
                  } as TimePace)
                : ({
                      type: 'reps',
                      reps: (block.defaultPace as RepsPace).reps,
                      tempo: (block.defaultPace as RepsPace).tempo,
                  } as RepsPace);
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      advanced: true,
                      exercises: prev.exercises.map((ex) => ({
                          ...ex,
                          paceOverride: ex.paceOverride ?? init,
                      })),
                  }
                : prev
        );
    };

    // default pace (advanced only)
    const onDefaultType = (type: 'time' | 'reps') =>
        setField(
            'defaultPace',
            type === 'time'
                ? ({ type: 'time', workSec: 20 } as TimePace)
                : ({ type: 'reps', reps: 10 } as RepsPace)
        );
    const onDefaultWorkSecNum = (n: number) =>
        isTimePace(block.defaultPace)
            ? setField('defaultPace', {
                  ...block.defaultPace,
                  workSec: n,
              } as TimePace)
            : undefined;
    const onDefaultRepsNum = (n: number) =>
        isRepsPace(block.defaultPace)
            ? setField('defaultPace', {
                  ...block.defaultPace,
                  reps: n,
              } as RepsPace)
            : undefined;
    const onDefaultTempo = (v: string) =>
        isRepsPace(block.defaultPace)
            ? setField('defaultPace', {
                  ...block.defaultPace,
                  tempo: v || undefined,
              } as RepsPace)
            : undefined;

    // exercise handlers (advanced only)
    const onExChange = (ei: number, next: WorkoutBlock['exercises'][number]) =>
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      exercises: prev.exercises.map((ex, j) =>
                          j === ei ? next : ex
                      ),
                  }
                : prev
        );
    const onAddExercise = () =>
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      exercises: [
                          ...prev.exercises,
                          {
                              id: uid(),
                              name: `Exercise ${prev.exercises.length + 1}`,
                          },
                      ],
                  }
                : prev
        );
    const onRemoveExercise = (ei: number) =>
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      exercises: prev.exercises.filter((_, j) => j !== ei),
                  }
                : prev
        );

    const validate = (): boolean => {
        const errs: string[] = [];
        if (block.scheme.sets <= 0) errs.push('Sets must be > 0.');
        if (block.exercises.length <= 0)
            errs.push('Add at least one exercise.');
        if (block.advanced) {
            block.exercises.forEach((ex, ei) => {
                if (!ex.name.trim())
                    errs.push(`Exercise ${ei + 1}: name is required.`);
                if (ex.paceOverride) {
                    if (
                        isTimePace(ex.paceOverride) &&
                        ex.paceOverride.workSec <= 0
                    )
                        errs.push(
                            `Exercise ${ei + 1}: work seconds must be > 0.`
                        );
                    if (
                        isRepsPace(ex.paceOverride) &&
                        ex.paceOverride.reps <= 0
                    )
                        errs.push(`Exercise ${ei + 1}: reps must be > 0.`);
                }
            });
        }
        setErrors(errs);
        return errs.length === 0;
    };

    const onSave = async () => {
        if (saving) return;
        if (!validate()) return;
        setSaving(true);
        try {
            if (id === 'draft') {
                updateDraftBlock(bi, block);
                router.back();
            } else {
                const nextBlocks = (workout?.blocks ?? []).map((b, i) =>
                    i === bi ? block : b
                );
                if (workout) update(workout.id, { blocks: nextBlocks });
                router.back();
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

    const isTime = isTimePace(block.defaultPace);
    const isReps = isRepsPace(block.defaultPace);

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
                    Edit Block {bi + 1}
                    {block.title ? ` — ${block.title}` : ''}
                </Text>

                <Text style={st.label}>Block Title (optional)</Text>
                <TextInput
                    value={block.title ?? ''}
                    onChangeText={onTitle}
                    style={st.input}
                />

                {/* FULL-WIDTH steppers */}
                <Stepper
                    label="Sets"
                    value={block.scheme.sets}
                    onChange={onSetsNum}
                    min={0}
                />
                <Stepper
                    label="# Exercises"
                    value={block.exercises.length}
                    onChange={onNumExercisesNum}
                    min={0}
                />
                <Stepper
                    label="Rest between sets (sec)"
                    value={block.scheme.restBetweenSetsSec}
                    onChange={onRestSetNum}
                    min={0}
                    step={5}
                />
                <Stepper
                    label="Rest between exercises (sec)"
                    value={block.scheme.restBetweenExercisesSec}
                    onChange={onRestExNum}
                    min={0}
                    step={5}
                />

                <View style={st.advRow}>
                    <Text style={st.advText}>
                        Advanced per-exercise options
                    </Text>
                    <Switch
                        value={!!block.advanced}
                        onValueChange={onToggleAdvanced}
                    />
                </View>

                {!!block.advanced && (
                    <>
                        <Text style={st.sectionTitle}>
                            Default Exercise Type
                        </Text>
                        <View style={st.segment}>
                            <Pressable
                                onPress={() => onDefaultType('time')}
                                style={[
                                    st.segmentBtn,
                                    isTime ? st.segmentBtnActive : null,
                                ]}
                            >
                                <Text
                                    style={
                                        isTime
                                            ? st.segmentTextActive
                                            : st.segmentText
                                    }
                                >
                                    Time
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => onDefaultType('reps')}
                                style={[
                                    st.segmentBtn,
                                    isReps ? st.segmentBtnActive : null,
                                ]}
                            >
                                <Text
                                    style={
                                        isReps
                                            ? st.segmentTextActive
                                            : st.segmentText
                                    }
                                >
                                    Reps
                                </Text>
                            </Pressable>
                        </View>

                        {isTime ? (
                            <Stepper
                                label="Default work (sec)"
                                value={(block.defaultPace as TimePace).workSec}
                                onChange={onDefaultWorkSecNum}
                                min={0}
                                step={5}
                            />
                        ) : (
                            <>
                                <Stepper
                                    label="Default reps"
                                    value={(block.defaultPace as RepsPace).reps}
                                    onChange={onDefaultRepsNum}
                                    min={0}
                                />
                                <Text style={st.subLabel}>
                                    Default tempo (optional)
                                </Text>
                                <TextInput
                                    value={
                                        (block.defaultPace as RepsPace).tempo ??
                                        ''
                                    }
                                    onChangeText={onDefaultTempo}
                                    style={st.input}
                                />
                            </>
                        )}

                        <Text style={st.sectionTitle}>Exercises</Text>
                        {block.exercises.map((ex, ei) => (
                            <ExerciseCard
                                key={ex.id}
                                index={ei}
                                exercise={ex}
                                advanced={!!block.advanced}
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
                    </>
                )}

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
                        <Text style={st.primaryText}>Save Block</Text>
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
    subLabel: { color: '#A1A1AA', marginTop: 10, marginBottom: 6 },
    input: {
        backgroundColor: '#131316',
        color: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
    },

    advRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    advText: { color: '#A1A1AA' },

    sectionTitle: {
        color: '#E5E7EB',
        fontWeight: '700',
        fontSize: 16,
        marginTop: 12,
    },

    segment: {
        flexDirection: 'row',
        backgroundColor: '#0F0F12',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
        overflow: 'hidden',
    },
    segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    segmentBtnActive: { backgroundColor: '#1F2937' },
    segmentText: { color: '#A1A1AA', fontWeight: '700' },
    segmentTextActive: { color: '#F2F2F2', fontWeight: '700' },

    addMinor: {
        alignSelf: 'flex-start',
        backgroundColor: '#1C1C1F',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 6,
    },
    addMinorText: { color: '#E5E7EB', fontWeight: '700' },

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

export default BlockEditScreen;
