// src/components/blocks/ExerciseCard.tsx
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Exercise, Pace, TimePace, RepsPace } from '../../core/entities';
import { isTimePace, isRepsPace } from '../../core/entities';
import { Stepper } from '../ui/Stepper';

export const ExerciseCard = ({
    index,
    exercise,
    advanced,
    onChange,
    onRemove,
}: {
    index: number;
    exercise: Exercise;
    advanced: boolean;
    onChange: (next: Exercise) => void;
    onRemove: () => void;
}) => {
    if (!advanced) return null;

    const override = exercise.paceOverride;
    const overrideTime = override && isTimePace(override);
    const overrideReps = override && isRepsPace(override);

    const setName = (v: string) => onChange({ ...exercise, name: v });
    const setType = (t: 'time' | 'reps') =>
        onChange({
            ...exercise,
            paceOverride:
                t === 'time'
                    ? ({ type: 'time', workSec: 20 } as TimePace)
                    : ({ type: 'reps', reps: 10 } as RepsPace),
        });

    const setWorkSecNum = (n: number) =>
        overrideTime &&
        onChange({
            ...exercise,
            paceOverride: { ...(override as TimePace), workSec: n },
        });

    const setRepsNum = (n: number) =>
        overrideReps &&
        onChange({
            ...exercise,
            paceOverride: { ...(override as RepsPace), reps: n },
        });

    const setTempo = (v: string) =>
        overrideReps &&
        onChange({
            ...exercise,
            paceOverride: { ...(override as RepsPace), tempo: v || undefined },
        });

    return (
        <View style={st.exercise}>
            <View style={st.rowSpread}>
                <Text style={st.exTitle}>Exercise {index + 1}</Text>
                <Pressable
                    onPress={onRemove}
                    style={({ pressed }) => [
                        st.removeTag,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.removeTagText}>Remove</Text>
                </Pressable>
            </View>

            <Text style={st.subLabel}>Name</Text>
            <TextInput
                value={exercise.name}
                onChangeText={setName}
                placeholder={`Exercise ${index + 1}`}
                style={st.input}
            />

            <Text style={st.subLabel}>Type</Text>
            <View style={st.segment}>
                <Pressable
                    onPress={() => setType('time')}
                    style={[
                        st.segmentBtn,
                        overrideTime ? st.segmentBtnActive : null,
                    ]}
                >
                    <Text
                        style={
                            overrideTime ? st.segmentTextActive : st.segmentText
                        }
                    >
                        Time
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setType('reps')}
                    style={[
                        st.segmentBtn,
                        overrideReps ? st.segmentBtnActive : null,
                    ]}
                >
                    <Text
                        style={
                            overrideReps ? st.segmentTextActive : st.segmentText
                        }
                    >
                        Reps
                    </Text>
                </Pressable>
            </View>

            {overrideTime ? (
                <Stepper
                    label="Work (sec)"
                    value={(override as TimePace).workSec}
                    onChange={setWorkSecNum}
                    min={0}
                    step={5}
                />
            ) : null}

            {overrideReps ? (
                <>
                    <Stepper
                        label="Reps"
                        value={(override as RepsPace).reps}
                        onChange={setRepsNum}
                        min={0}
                    />
                    <Text style={st.subLabel}>Tempo (optional)</Text>
                    <TextInput
                        value={(override as RepsPace).tempo ?? ''}
                        onChangeText={setTempo}
                        style={st.input}
                    />
                </>
            ) : null}
        </View>
    );
};

const st = StyleSheet.create({
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
    rowSpread: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

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

    removeTag: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#2A0E0E',
        borderWidth: 1,
        borderColor: '#7F1D1D',
    },
    removeTagText: { color: '#FCA5A5', fontWeight: '700' },
    pressed: { opacity: 0.9 },
});
