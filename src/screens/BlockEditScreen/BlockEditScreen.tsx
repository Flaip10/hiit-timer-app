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

import { TopBar } from '@components/navigation/TopBar';
import { Stepper } from '@components/ui/Stepper';
import { ExerciseCard } from '@components/blocks/ExerciseCard';

import { useWorkout, useWorkouts } from '@state/useWorkouts';
import { getDraftBlocks, updateDraftBlock } from '@state/editCache';

import type {
    WorkoutBlock,
    TimePace,
    RepsPace,
    Exercise,
} from '@core/entities';
import { isTimePace, isRepsPace } from '@core/entities';
import { uid } from '@core/id';

// ---------- helpers ----------
const toPosInt = (s: string | number, fallback = 0): number => {
    const n = typeof s === 'number' ? s : parseInt(String(s ?? ''), 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
};

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
    exercises: block.exercises.map(
        (e) => ({ id: e.id, name: e.name }) as Exercise
    ),
});

// ---------- component ----------
const BlockEditScreen = () => {
    const { id, index } = useLocalSearchParams<{
        id?: string;
        index?: string;
    }>();
    const bi = Number(index ?? '-1');

    const router = useRouter();
    const workout = useWorkout(id);
    const { update } = useWorkouts();

    // hydrate initial block
    const [block, setBlock] = useState<WorkoutBlock | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // existing workout path
        if (id && workout?.blocks?.[bi]) {
            const copy = JSON.parse(
                JSON.stringify(workout.blocks[bi])
            ) as WorkoutBlock;
            setBlock(copy);
            return;
        }
        // draft path
        if (!id) {
            const draftBlocks = getDraftBlocks();
            if (draftBlocks && draftBlocks[bi]) {
                setBlock(
                    JSON.parse(JSON.stringify(draftBlocks[bi])) as WorkoutBlock
                );
                return;
            }
        }
        // invalid index / missing block
        setBlock(null);
    }, [id, workout, bi]);

    const validLength = id
        ? (workout?.blocks.length ?? 0)
        : (getDraftBlocks()?.length ?? 0);
    const notFound = Number.isNaN(bi) || bi < 0 || bi >= validLength || !block;

    // ----- block-level setters -----
    const setField = <K extends keyof WorkoutBlock>(
        key: K,
        value: WorkoutBlock[K]
    ) => setBlock((prev) => (prev ? { ...prev, [key]: value } : prev));

    const onTitle = (v: string) => setField('title', v);

    const onSets = (n: number) =>
        setField('scheme', {
            ...block!.scheme,
            sets: toPosInt(n, block!.scheme.sets),
        });

    const onRestBetweenSets = (n: number) =>
        setField('scheme', {
            ...block!.scheme,
            restBetweenSetsSec: toPosInt(n, block!.scheme.restBetweenSetsSec),
        });

    const onRestBetweenExercises = (n: number) =>
        setField('scheme', {
            ...block!.scheme,
            restBetweenExercisesSec: toPosInt(
                n,
                block!.scheme.restBetweenExercisesSec
            ),
        });

    const onNumExercises = (n: number) =>
        setBlock((prev) =>
            prev
                ? ensureExerciseCount(
                      prev,
                      Math.max(0, toPosInt(n, prev.exercises.length))
                  )
                : prev
        );

    // advanced toggle & defaults
    const onToggleAdvanced = (enabled: boolean) => {
        if (!block) return;
        if (!enabled)
            return setBlock((prev) => (prev ? clearOverrides(prev) : prev));

        const initOverride =
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
                          paceOverride: ex.paceOverride ?? initOverride,
                      })),
                  }
                : prev
        );
    };

    const onDefaultType = (type: 'time' | 'reps') =>
        setField(
            'defaultPace',
            type === 'time'
                ? ({ type: 'time', workSec: 20 } as TimePace)
                : ({ type: 'reps', reps: 10 } as RepsPace)
        );

    const onDefaultWorkSec = (n: number) =>
        isTimePace(block!.defaultPace) &&
        setField('defaultPace', {
            ...(block!.defaultPace as TimePace),
            workSec: toPosInt(n, (block!.defaultPace as TimePace).workSec),
        } as TimePace);

    const onDefaultReps = (n: number) =>
        isRepsPace(block!.defaultPace) &&
        setField('defaultPace', {
            ...(block!.defaultPace as RepsPace),
            reps: toPosInt(n, (block!.defaultPace as RepsPace).reps),
        } as RepsPace);

    const onDefaultTempo = (v: string) =>
        isRepsPace(block!.defaultPace) &&
        setField('defaultPace', {
            ...(block!.defaultPace as RepsPace),
            tempo: v || undefined,
        } as RepsPace);

    // per-exercise changes (advanced)
    const onExChange = (ei: number, next: Exercise) =>
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

    // ----- validation & save -----
    const validate = (): boolean => {
        if (!block) return false;
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

    const onSave = () => {
        if (!block || saving) return;
        if (!validate()) return;

        setSaving(true);
        try {
            if (id && workout) {
                const nextBlocks = [...(workout.blocks ?? [])];
                nextBlocks[bi] = block;
                update(workout.id, { blocks: nextBlocks });
                router.back();
            } else {
                // draft path
                updateDraftBlock(bi, block);
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

    if (notFound) {
        return (
            <View style={st.container}>
                <TopBar title="Edit Block" />
                <View style={st.content}>
                    <Text style={st.err}>Block not found.</Text>
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
            </View>
        );
    }

    const isTime = isTimePace(block.defaultPace);
    const isReps = isRepsPace(block.defaultPace);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <View style={st.container}>
                <TopBar
                    title={`Block ${bi + 1}${block.title ? ` — ${block.title}` : ''}`}
                />
                <ScrollView
                    contentContainerStyle={st.content}
                    keyboardShouldPersistTaps="handled"
                >
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
                        value={block.scheme.sets}
                        onChange={onSets}
                        min={0}
                    />
                    <Stepper
                        label="# Exercises"
                        value={block.exercises.length}
                        onChange={onNumExercises}
                        min={0}
                    />
                    <Stepper
                        label="Rest between sets (sec)"
                        value={block.scheme.restBetweenSetsSec}
                        onChange={onRestBetweenSets}
                        min={0}
                        step={5}
                    />
                    <Stepper
                        label="Rest between exercises (sec)"
                        value={block.scheme.restBetweenExercisesSec}
                        onChange={onRestBetweenExercises}
                        min={0}
                        step={5}
                    />

                    {/* Advanced toggle */}
                    <View style={st.advRow}>
                        <Text style={st.advText}>
                            Advanced per-exercise options
                        </Text>
                        <Switch
                            value={!!block.advanced}
                            onValueChange={onToggleAdvanced}
                        />
                    </View>

                    {/* Advanced-only section */}
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
                                    value={
                                        (block.defaultPace as TimePace).workSec
                                    }
                                    onChange={onDefaultWorkSec}
                                    min={0}
                                    step={5}
                                />
                            ) : (
                                <>
                                    <Stepper
                                        label="Default reps"
                                        value={
                                            (block.defaultPace as RepsPace).reps
                                        }
                                        onChange={onDefaultReps}
                                        min={0}
                                    />
                                    <Text style={st.subLabel}>
                                        Default tempo (optional)
                                    </Text>
                                    <TextInput
                                        value={
                                            (block.defaultPace as RepsPace)
                                                .tempo ?? ''
                                        }
                                        onChangeText={onDefaultTempo}
                                        style={st.input}
                                        placeholder="e.g., 3-1-3"
                                        placeholderTextColor="#6B7280"
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
                                <Text style={st.addMinorText}>
                                    ＋ Add Exercise
                                </Text>
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
            </View>
        </KeyboardAvoidingView>
    );
};

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C' },
    content: { flexGrow: 1, padding: 16, gap: 12, paddingBottom: 28 },
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

    sectionTitle: {
        color: '#E5E7EB',
        fontWeight: '700',
        fontSize: 16,
        marginTop: 12,
    },

    advRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    advText: { color: '#A1A1AA' },

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
        borderWidth: 1,
        borderColor: '#1F1F23',
    },
    addMinorText: { color: '#E5E7EB', fontWeight: '700' },

    footer: { flexDirection: 'row', gap: 10, marginTop: 16, paddingBottom: 8 },
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
    err: { color: '#FCA5A5', marginBottom: 12 },
});

export default BlockEditScreen;
