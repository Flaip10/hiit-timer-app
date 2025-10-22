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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkout, useWorkouts } from '../../src/state/useWorkouts';
import type { Workout, WorkoutBlock, Exercise } from '../../src/core/entities';
import { uid } from '../../src/core/id';

const toPosInt = (s: string, fallback = 0): number => {
    const n = parseInt(String(s), 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const cloneWorkout = (w: Workout): Workout =>
    JSON.parse(JSON.stringify(w)) as Workout;

const emptyExercise = (): Exercise => ({
    id: uid(),
    name: '',
    pace: { type: 'time', workSec: 20 },
    setScheme: { sets: 1, restBetweenSetsSec: 0 },
    notes: undefined,
});

const emptyBlock = (): WorkoutBlock => ({
    id: uid(),
    title: '',
    exercises: [emptyExercise()],
    restBetweenExercisesSec: 0,
});

const EditWorkoutScreen = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const existing = useWorkout(id);
    const { add, update } = useWorkouts();
    const router = useRouter();

    // Local working copy
    const [name, setName] = useState(existing?.name ?? '');
    const [blocks, setBlocks] = useState<WorkoutBlock[]>(
        existing ? cloneWorkout(existing).blocks : [emptyBlock()]
    );
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (existing) {
            setName(existing.name);
            setBlocks(cloneWorkout(existing).blocks);
        }
    }, [existing]);

    const onAddBlock = () => setBlocks((prev) => [...prev, emptyBlock()]);
    const onRemoveBlock = (bi: number) =>
        setBlocks((prev) => prev.filter((_, i) => i !== bi));
    const onBlockTitle = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) => (i === bi ? { ...b, title: v } : b))
        );
    const onBlockRest = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi ? { ...b, restBetweenExercisesSec: toPosInt(v, 0) } : b
            )
        );

    const onAddExercise = (bi: number) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? { ...b, exercises: [...b.exercises, emptyExercise()] }
                    : b
            )
        );

    const onRemoveExercise = (bi: number, ei: number) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: b.exercises.filter((_, j) => j !== ei),
                      }
                    : b
            )
        );

    const onExName = (bi: number, ei: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: b.exercises.map((ex, j) =>
                              j === ei ? { ...ex, name: v } : ex
                          ),
                      }
                    : b
            )
        );

    const onExPaceType = (bi: number, ei: number, type: 'time' | 'reps') =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: b.exercises.map((ex, j) =>
                              j === ei
                                  ? {
                                        ...ex,
                                        pace:
                                            type === 'time'
                                                ? { type: 'time', workSec: 20 }
                                                : {
                                                      type: 'reps',
                                                      reps: 10,
                                                      tempo: undefined,
                                                  },
                                    }
                                  : ex
                          ),
                      }
                    : b
            )
        );

    const onExWorkSec = (bi: number, ei: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: b.exercises.map((ex, j) =>
                              j === ei && ex.pace.type === 'time'
                                  ? {
                                        ...ex,
                                        pace: {
                                            ...ex.pace,
                                            workSec: toPosInt(v, 0),
                                        },
                                    }
                                  : ex
                          ),
                      }
                    : b
            )
        );

    const onExReps = (bi: number, ei: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: b.exercises.map((ex, j) =>
                              j === ei && ex.pace.type === 'reps'
                                  ? {
                                        ...ex,
                                        pace: {
                                            ...ex.pace,
                                            reps: toPosInt(v, 0),
                                        },
                                    }
                                  : ex
                          ),
                      }
                    : b
            )
        );

    const onExTempo = (bi: number, ei: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: b.exercises.map((ex, j) =>
                              j === ei && ex.pace.type === 'reps'
                                  ? {
                                        ...ex,
                                        pace: {
                                            ...ex.pace,
                                            tempo: v || undefined,
                                        },
                                    }
                                  : ex
                          ),
                      }
                    : b
            )
        );

    const onExSets = (bi: number, ei: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: b.exercises.map((ex, j) =>
                              j === ei
                                  ? {
                                        ...ex,
                                        setScheme: {
                                            ...ex.setScheme,
                                            sets: toPosInt(v, 0),
                                        },
                                    }
                                  : ex
                          ),
                      }
                    : b
            )
        );

    const onExRestBetweenSets = (bi: number, ei: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: b.exercises.map((ex, j) =>
                              j === ei
                                  ? {
                                        ...ex,
                                        setScheme: {
                                            ...ex.setScheme,
                                            restBetweenSetsSec: toPosInt(v, 0),
                                        },
                                    }
                                  : ex
                          ),
                      }
                    : b
            )
        );

    const validate = (): boolean => {
        const errs: string[] = [];
        if (!name.trim()) errs.push('Name is required.');

        blocks.forEach((b, bi) => {
            if (b.exercises.length === 0)
                errs.push(`Block ${bi + 1} must have at least one exercise.`);
            b.exercises.forEach((ex, ei) => {
                if (!ex.name.trim())
                    errs.push(
                        `Block ${bi + 1}, Exercise ${ei + 1}: name is required.`
                    );
                if (ex.setScheme.sets <= 0)
                    errs.push(
                        `Block ${bi + 1}, ${ex.name || `Exercise ${ei + 1}`}: sets must be > 0.`
                    );
                if (ex.pace.type === 'time') {
                    // time-based work
                    if ((ex.pace.workSec ?? 0) <= 0)
                        errs.push(
                            `Block ${bi + 1}, ${ex.name || `Exercise ${ei + 1}`}: work seconds must be > 0.`
                        );
                } else {
                    // reps-based
                    if ((ex.pace.reps ?? 0) <= 0)
                        errs.push(
                            `Block ${bi + 1}, ${ex.name || `Exercise ${ei + 1}`}: reps must be > 0.`
                        );
                }
            });
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
                router.replace(`/workouts/${existing.id}`);
            } else {
                const newId = payload.id;
                // ensure ids exist in nested structures (already done by builders)
                // but keep this in case user deleted everything & added again:
                const normalized: Workout = {
                    ...payload,
                    blocks: payload.blocks.map((b) => ({
                        ...b,
                        id: b.id || uid(),
                        exercises: b.exercises.map((ex) => ({
                            ...ex,
                            id: ex.id || uid(),
                        })),
                    })),
                };
                // add returns id in your store; if not, just use newId
                // @ts-ignore add returns string in our store definition
                const addedId: string = (await add(normalized)) ?? newId;
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
                    placeholder="e.g., Lower Body A"
                    placeholderTextColor="#6B7280"
                    style={st.input}
                />

                {blocks.map((b, bi) => (
                    <View key={b.id} style={st.block}>
                        <View style={st.blockHeader}>
                            <Text style={st.blockTitle}>Block {bi + 1}</Text>
                            <Pressable
                                onPress={() => onRemoveBlock(bi)}
                                style={({ pressed }) => [
                                    st.removeSmall,
                                    pressed && st.pressed,
                                ]}
                            >
                                <Text style={st.removeSmallText}>
                                    Remove Block
                                </Text>
                            </Pressable>
                        </View>

                        <Text style={st.subLabel}>Block Title (optional)</Text>
                        <TextInput
                            value={b.title ?? ''}
                            onChangeText={(v) => onBlockTitle(bi, v)}
                            style={st.input}
                        />

                        <Text style={st.subLabel}>
                            Rest between exercises (sec)
                        </Text>
                        <TextInput
                            keyboardType="number-pad"
                            value={String(b.restBetweenExercisesSec ?? 0)}
                            onChangeText={(v) => onBlockRest(bi, v)}
                            style={st.input}
                        />

                        <View style={{ height: 8 }} />
                        <Text style={st.sectionTitle}>Exercises</Text>

                        {b.exercises.map((ex, ei) => {
                            const isTime = ex.pace.type === 'time';
                            return (
                                <View key={ex.id} style={st.exercise}>
                                    <View style={st.rowSpread}>
                                        <Text style={st.exTitle}>
                                            Exercise {ei + 1}
                                        </Text>
                                        <Pressable
                                            onPress={() =>
                                                onRemoveExercise(bi, ei)
                                            }
                                            style={({ pressed }) => [
                                                st.removeTag,
                                                pressed && st.pressed,
                                            ]}
                                        >
                                            <Text style={st.removeTagText}>
                                                Remove
                                            </Text>
                                        </Pressable>
                                    </View>

                                    <Text style={st.subLabel}>Name</Text>
                                    <TextInput
                                        value={ex.name}
                                        onChangeText={(v) =>
                                            onExName(bi, ei, v)
                                        }
                                        placeholder="e.g., Intervals / Squat"
                                        style={st.input}
                                    />

                                    <Text style={st.subLabel}>Pace</Text>
                                    <View style={st.segment}>
                                        <Pressable
                                            onPress={() =>
                                                onExPaceType(bi, ei, 'time')
                                            }
                                            style={[
                                                st.segmentBtn,
                                                isTime
                                                    ? st.segmentBtnActive
                                                    : null,
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
                                            onPress={() =>
                                                onExPaceType(bi, ei, 'reps')
                                            }
                                            style={[
                                                st.segmentBtn,
                                                !isTime
                                                    ? st.segmentBtnActive
                                                    : null,
                                            ]}
                                        >
                                            <Text
                                                style={
                                                    !isTime
                                                        ? st.segmentTextActive
                                                        : st.segmentText
                                                }
                                            >
                                                Reps
                                            </Text>
                                        </Pressable>
                                    </View>

                                    {isTime ? (
                                        <>
                                            <Text style={st.subLabel}>
                                                Work (sec)
                                            </Text>
                                            <TextInput
                                                keyboardType="number-pad"
                                                value={String(
                                                    ex.pace.workSec ?? 0
                                                )}
                                                onChangeText={(v) =>
                                                    onExWorkSec(bi, ei, v)
                                                }
                                                style={st.input}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Text style={st.subLabel}>
                                                Reps
                                            </Text>
                                            <TextInput
                                                keyboardType="number-pad"
                                                value={String(
                                                    ex.pace.reps ?? 0
                                                )}
                                                onChangeText={(v) =>
                                                    onExReps(bi, ei, v)
                                                }
                                                style={st.input}
                                            />
                                            <Text style={st.subLabel}>
                                                Tempo (optional, e.g., 3-1-3)
                                            </Text>
                                            <TextInput
                                                value={ex.pace.tempo ?? ''}
                                                onChangeText={(v) =>
                                                    onExTempo(bi, ei, v)
                                                }
                                                style={st.input}
                                            />
                                        </>
                                    )}

                                    <View style={st.row}>
                                        <View style={st.col}>
                                            <Text style={st.subLabel}>
                                                Sets
                                            </Text>
                                            <TextInput
                                                keyboardType="number-pad"
                                                value={String(
                                                    ex.setScheme.sets
                                                )}
                                                onChangeText={(v) =>
                                                    onExSets(bi, ei, v)
                                                }
                                                style={st.input}
                                            />
                                        </View>
                                        <View style={st.col}>
                                            <Text style={st.subLabel}>
                                                Rest between sets (sec)
                                            </Text>
                                            <TextInput
                                                keyboardType="number-pad"
                                                value={String(
                                                    ex.setScheme
                                                        .restBetweenSetsSec
                                                )}
                                                onChangeText={(v) =>
                                                    onExRestBetweenSets(
                                                        bi,
                                                        ei,
                                                        v
                                                    )
                                                }
                                                style={st.input}
                                            />
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        <Pressable
                            onPress={() => onAddExercise(bi)}
                            style={({ pressed }) => [
                                st.addMinor,
                                pressed && st.pressed,
                            ]}
                        >
                            <Text style={st.addMinorText}>＋ Add Exercise</Text>
                        </Pressable>
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
    sectionTitle: { color: '#E5E7EB', fontWeight: '700', fontSize: 16 },
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

    block: {
        backgroundColor: '#111113',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 12,
        gap: 8,
        marginTop: 12,
    },
    blockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    blockTitle: { color: '#E5E7EB', fontWeight: '700', fontSize: 16 },

    exercise: {
        backgroundColor: '#131316',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 10,
        gap: 6,
        marginTop: 8,
    },
    exTitle: { color: '#E5E7EB', fontWeight: '700' },

    row: { flexDirection: 'row', gap: 12 },
    rowSpread: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    col: { flex: 1 },

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

    removeSmall: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#3B0D0D',
        borderWidth: 1,
        borderColor: '#7F1D1D',
    },
    removeSmallText: { color: '#FCA5A5', fontWeight: '700' },
    removeTag: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#2A0E0E',
        borderWidth: 1,
        borderColor: '#7F1D1D',
    },
    removeTagText: { color: '#FCA5A5', fontWeight: '700' },

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
