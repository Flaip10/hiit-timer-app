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
import type {
    Workout,
    WorkoutBlock,
    Exercise,
    Pace,
    TimePace,
    RepsPace,
} from '../../src/core/entities';
import { isTimePace, isRepsPace } from '../../src/core/entities';
import { uid } from '../../src/core/id';

// ---------- helpers ----------
const toPosInt = (s: string, fallback = 0): number => {
    const n = parseInt(String(s), 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const emptyExercise = (name = ''): Exercise => ({ id: uid(), name });

const emptyBlock = (): WorkoutBlock => ({
    id: uid(),
    title: '',
    defaultPace: { type: 'time', workSec: 20 },
    scheme: { sets: 3, restBetweenSetsSec: 30, restBetweenExercisesSec: 10 },
    advanced: false,
    exercises: [emptyExercise('Exercise 1')],
});

const ensureExerciseCount = (
    block: WorkoutBlock,
    count: number
): WorkoutBlock => {
    const next: WorkoutBlock = { ...block, exercises: [...block.exercises] };
    while (next.exercises.length < count) {
        next.exercises.push(
            emptyExercise(`Exercise ${next.exercises.length + 1}`)
        );
    }
    while (next.exercises.length > count) {
        next.exercises.pop();
    }
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
const EditWorkoutScreen = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const existing = useWorkout(id);
    const { add, update } = useWorkouts();
    const router = useRouter();

    // local working copy
    const [name, setName] = useState(existing?.name ?? '');
    const [blocks, setBlocks] = useState<WorkoutBlock[]>(
        existing?.blocks ?? [emptyBlock()]
    );
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // sync when editing an existing workout
    useEffect(() => {
        if (existing) {
            setName(existing.name);
            setBlocks(
                JSON.parse(JSON.stringify(existing.blocks)) as WorkoutBlock[]
            );
        }
    }, [existing]);

    // ----- block mutations -----
    const onAddBlock = () => setBlocks((prev) => [...prev, emptyBlock()]);
    const onRemoveBlock = (bi: number) =>
        setBlocks((prev) => prev.filter((_, i) => i !== bi));

    const onBlockTitle = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) => (i === bi ? { ...b, title: v } : b))
        );

    const onSets = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? { ...b, scheme: { ...b.scheme, sets: toPosInt(v, 0) } }
                    : b
            )
        );

    const onRestBetweenSets = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          scheme: {
                              ...b.scheme,
                              restBetweenSetsSec: toPosInt(v, 0),
                          },
                      }
                    : b
            )
        );

    const onRestBetweenExercises = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          scheme: {
                              ...b.scheme,
                              restBetweenExercisesSec: toPosInt(v, 0),
                          },
                      }
                    : b
            )
        );

    const onNumExercises = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi ? ensureExerciseCount(b, toPosInt(v, 0)) : b
            )
        );

    // default pace
    const onDefaultPaceType = (bi: number, type: 'time' | 'reps') =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          defaultPace:
                              type === 'time'
                                  ? ({ type: 'time', workSec: 20 } as TimePace)
                                  : ({ type: 'reps', reps: 10 } as RepsPace),
                      }
                    : b
            )
        );

    const onDefaultWorkSec = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi && isTimePace(b.defaultPace)
                    ? {
                          ...b,
                          defaultPace: {
                              ...b.defaultPace,
                              workSec: toPosInt(v, 0),
                          },
                      }
                    : b
            )
        );

    const onDefaultReps = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi && isRepsPace(b.defaultPace)
                    ? {
                          ...b,
                          defaultPace: {
                              ...b.defaultPace,
                              reps: toPosInt(v, 0),
                          },
                      }
                    : b
            )
        );

    const onDefaultTempo = (bi: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi && isRepsPace(b.defaultPace)
                    ? {
                          ...b,
                          defaultPace: {
                              ...b.defaultPace,
                              tempo: v || undefined,
                          },
                      }
                    : b
            )
        );

    // advanced toggle
    const onToggleAdvanced = (bi: number, enabled: boolean) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? enabled
                        ? { ...b, advanced: true }
                        : clearOverrides(b)
                    : b
            )
        );

    // exercises (name + optional overrides when advanced)
    const onAddExercise = (bi: number) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: [
                              ...b.exercises,
                              emptyExercise(
                                  `Exercise ${b.exercises.length + 1}`
                              ),
                          ],
                      }
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

    // overrides (only when advanced)
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
                                        paceOverride:
                                            type === 'time'
                                                ? ({
                                                      type: 'time',
                                                      workSec: 20,
                                                  } as TimePace)
                                                : ({
                                                      type: 'reps',
                                                      reps: 10,
                                                  } as RepsPace),
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
                              j === ei &&
                              ex.paceOverride &&
                              isTimePace(ex.paceOverride)
                                  ? {
                                        ...ex,
                                        paceOverride: {
                                            ...ex.paceOverride,
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
                              j === ei &&
                              ex.paceOverride &&
                              isRepsPace(ex.paceOverride)
                                  ? {
                                        ...ex,
                                        paceOverride: {
                                            ...ex.paceOverride,
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
                              j === ei &&
                              ex.paceOverride &&
                              isRepsPace(ex.paceOverride)
                                  ? {
                                        ...ex,
                                        paceOverride: {
                                            ...ex.paceOverride,
                                            tempo: v || undefined,
                                        },
                                    }
                                  : ex
                          ),
                      }
                    : b
            )
        );

    const onClearOverride = (bi: number, ei: number) =>
        setBlocks((prev) =>
            prev.map((b, i) =>
                i === bi
                    ? {
                          ...b,
                          exercises: b.exercises.map((ex, j) =>
                              j === ei
                                  ? ({ id: ex.id, name: ex.name } as Exercise)
                                  : ex
                          ),
                      }
                    : b
            )
        );

    // ----- validation & save -----
    const validate = (): boolean => {
        const errs: string[] = [];
        if (!name.trim()) errs.push('Name is required.');

        blocks.forEach((b, bi) => {
            if (b.scheme.sets <= 0)
                errs.push(`Block ${bi + 1}: sets must be > 0.`);
            if (b.exercises.length <= 0)
                errs.push(`Block ${bi + 1}: add at least one exercise.`);

            // default pace checks
            if (isTimePace(b.defaultPace) && b.defaultPace.workSec <= 0) {
                errs.push(`Block ${bi + 1}: default work seconds must be > 0.`);
            }
            if (isRepsPace(b.defaultPace) && b.defaultPace.reps <= 0) {
                errs.push(`Block ${bi + 1}: default reps must be > 0.`);
            }

            // overrides checks (only if advanced & override present)
            if (b.advanced) {
                b.exercises.forEach((ex, ei) => {
                    if (!ex.name.trim())
                        errs.push(
                            `Block ${bi + 1}, Exercise ${ei + 1}: name is required.`
                        );
                    if (ex.paceOverride) {
                        if (
                            isTimePace(ex.paceOverride) &&
                            ex.paceOverride.workSec <= 0
                        ) {
                            errs.push(
                                `Block ${bi + 1}, ${ex.name || `Exercise ${ei + 1}`}: override work seconds must be > 0.`
                            );
                        }
                        if (
                            isRepsPace(ex.paceOverride) &&
                            ex.paceOverride.reps <= 0
                        ) {
                            errs.push(
                                `Block ${bi + 1}, ${ex.name || `Exercise ${ei + 1}`}: override reps must be > 0.`
                            );
                        }
                    }
                });
            } else {
                // simple mode: still require names
                b.exercises.forEach((ex, ei) => {
                    if (!ex.name.trim())
                        errs.push(
                            `Block ${bi + 1}, Exercise ${ei + 1}: name is required.`
                        );
                });
            }
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
                // @ts-ignore store add returns id
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

    // ---------- render ----------
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

                {blocks.map((b, bi) => {
                    const isTime = isTimePace(b.defaultPace);
                    const isReps = isRepsPace(b.defaultPace);

                    return (
                        <View key={b.id} style={st.block}>
                            <View style={st.blockHeader}>
                                <Text style={st.blockTitle}>
                                    Block {bi + 1}
                                    {b.title ? ` — ${b.title}` : ''}
                                </Text>
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

                            <Text style={st.subLabel}>
                                Block Title (optional)
                            </Text>
                            <TextInput
                                value={b.title ?? ''}
                                onChangeText={(v) => onBlockTitle(bi, v)}
                                style={st.input}
                            />

                            <View style={st.row}>
                                <View style={st.col}>
                                    <Text style={st.subLabel}>Sets</Text>
                                    <TextInput
                                        keyboardType="number-pad"
                                        value={String(b.scheme.sets)}
                                        onChangeText={(v) => onSets(bi, v)}
                                        style={st.input}
                                    />
                                </View>
                                <View style={st.col}>
                                    <Text style={st.subLabel}># Exercises</Text>
                                    <TextInput
                                        keyboardType="number-pad"
                                        value={String(b.exercises.length)}
                                        onChangeText={(v) =>
                                            onNumExercises(bi, v)
                                        }
                                        style={st.input}
                                    />
                                </View>
                            </View>

                            <View style={st.row}>
                                <View style={st.col}>
                                    <Text style={st.subLabel}>
                                        Rest between sets (sec)
                                    </Text>
                                    <TextInput
                                        keyboardType="number-pad"
                                        value={String(
                                            b.scheme.restBetweenSetsSec
                                        )}
                                        onChangeText={(v) =>
                                            onRestBetweenSets(bi, v)
                                        }
                                        style={st.input}
                                    />
                                </View>
                                <View style={st.col}>
                                    <Text style={st.subLabel}>
                                        Rest between exercises (sec)
                                    </Text>
                                    <TextInput
                                        keyboardType="number-pad"
                                        value={String(
                                            b.scheme.restBetweenExercisesSec
                                        )}
                                        onChangeText={(v) =>
                                            onRestBetweenExercises(bi, v)
                                        }
                                        style={st.input}
                                    />
                                </View>
                            </View>

                            <Text style={st.sectionTitle}>
                                Default Exercise Type
                            </Text>
                            <View style={st.segment}>
                                <Pressable
                                    onPress={() =>
                                        onDefaultPaceType(bi, 'time')
                                    }
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
                                    onPress={() =>
                                        onDefaultPaceType(bi, 'reps')
                                    }
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
                                <>
                                    <Text style={st.subLabel}>Work (sec)</Text>
                                    <TextInput
                                        keyboardType="number-pad"
                                        value={String(
                                            (b.defaultPace as TimePace).workSec
                                        )}
                                        onChangeText={(v) =>
                                            onDefaultWorkSec(bi, v)
                                        }
                                        style={st.input}
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={st.subLabel}>Reps</Text>
                                    <TextInput
                                        keyboardType="number-pad"
                                        value={String(
                                            (b.defaultPace as RepsPace).reps
                                        )}
                                        onChangeText={(v) =>
                                            onDefaultReps(bi, v)
                                        }
                                        style={st.input}
                                    />
                                    <Text style={st.subLabel}>
                                        Tempo (optional)
                                    </Text>
                                    <TextInput
                                        value={
                                            (b.defaultPace as RepsPace).tempo ??
                                            ''
                                        }
                                        onChangeText={(v) =>
                                            onDefaultTempo(bi, v)
                                        }
                                        style={st.input}
                                    />
                                </>
                            )}

                            <Text style={st.sectionTitle}>Exercises</Text>

                            {b.exercises.map((ex, ei) => {
                                const showOverrides =
                                    !!b.advanced && ex.paceOverride != null;
                                const overrideTime =
                                    showOverrides &&
                                    isTimePace(ex.paceOverride as Pace);
                                const overrideReps =
                                    showOverrides &&
                                    isRepsPace(ex.paceOverride as Pace);

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
                                            placeholder={`Exercise ${ei + 1}`}
                                            style={st.input}
                                        />

                                        {!!b.advanced && (
                                            <>
                                                <Text style={st.subLabel}>
                                                    Override Type (optional)
                                                </Text>
                                                <View style={st.segment}>
                                                    <Pressable
                                                        onPress={() =>
                                                            onExPaceType(
                                                                bi,
                                                                ei,
                                                                'time'
                                                            )
                                                        }
                                                        style={[
                                                            st.segmentBtn,
                                                            overrideTime
                                                                ? st.segmentBtnActive
                                                                : null,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={
                                                                overrideTime
                                                                    ? st.segmentTextActive
                                                                    : st.segmentText
                                                            }
                                                        >
                                                            Time
                                                        </Text>
                                                    </Pressable>
                                                    <Pressable
                                                        onPress={() =>
                                                            onExPaceType(
                                                                bi,
                                                                ei,
                                                                'reps'
                                                            )
                                                        }
                                                        style={[
                                                            st.segmentBtn,
                                                            overrideReps
                                                                ? st.segmentBtnActive
                                                                : null,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={
                                                                overrideReps
                                                                    ? st.segmentTextActive
                                                                    : st.segmentText
                                                            }
                                                        >
                                                            Reps
                                                        </Text>
                                                    </Pressable>
                                                    <Pressable
                                                        onPress={() =>
                                                            onClearOverride(
                                                                bi,
                                                                ei
                                                            )
                                                        }
                                                        style={[
                                                            st.segmentBtn,
                                                            { maxWidth: 90 },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={
                                                                st.segmentText
                                                            }
                                                        >
                                                            Clear
                                                        </Text>
                                                    </Pressable>
                                                </View>

                                                {overrideTime ? (
                                                    <>
                                                        <Text
                                                            style={st.subLabel}
                                                        >
                                                            Work (sec)
                                                        </Text>
                                                        <TextInput
                                                            keyboardType="number-pad"
                                                            value={String(
                                                                (
                                                                    ex.paceOverride as TimePace
                                                                ).workSec
                                                            )}
                                                            onChangeText={(v) =>
                                                                onExWorkSec(
                                                                    bi,
                                                                    ei,
                                                                    v
                                                                )
                                                            }
                                                            style={st.input}
                                                        />
                                                    </>
                                                ) : null}

                                                {overrideReps ? (
                                                    <>
                                                        <Text
                                                            style={st.subLabel}
                                                        >
                                                            Reps
                                                        </Text>
                                                        <TextInput
                                                            keyboardType="number-pad"
                                                            value={String(
                                                                (
                                                                    ex.paceOverride as RepsPace
                                                                ).reps
                                                            )}
                                                            onChangeText={(v) =>
                                                                onExReps(
                                                                    bi,
                                                                    ei,
                                                                    v
                                                                )
                                                            }
                                                            style={st.input}
                                                        />
                                                        <Text
                                                            style={st.subLabel}
                                                        >
                                                            Tempo (optional)
                                                        </Text>
                                                        <TextInput
                                                            value={
                                                                (
                                                                    ex.paceOverride as RepsPace
                                                                ).tempo ?? ''
                                                            }
                                                            onChangeText={(v) =>
                                                                onExTempo(
                                                                    bi,
                                                                    ei,
                                                                    v
                                                                )
                                                            }
                                                            style={st.input}
                                                        />
                                                    </>
                                                ) : null}
                                            </>
                                        )}
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
                                <Text style={st.addMinorText}>
                                    ＋ Add Exercise
                                </Text>
                            </Pressable>

                            <View style={st.advRow}>
                                <Text style={st.advText}>
                                    Advanced per-exercise options
                                </Text>
                                <Switch
                                    value={!!b.advanced}
                                    onValueChange={(v) =>
                                        onToggleAdvanced(bi, v)
                                    }
                                />
                            </View>
                        </View>
                    );
                })}

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

    advRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    advText: { color: '#A1A1AA' },

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
