import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Exercise } from '../../core/entities';
import { Stepper } from '../ui/Stepper/Stepper';

type Props = {
    index: number;
    exercise: Exercise;
    onChange: (next: Exercise) => void;
    onRemove: () => void;
};

export const ExerciseCard = ({
    index,
    exercise,
    onChange,
    onRemove,
}: Props) => {
    const setName = (v: string) => {
        onChange({ ...exercise, name: v });
    };

    const setDurationSec = (n: number) => {
        // For now we treat everything as time-based.
        // Ensure mode stays 'time' while editing in this screen.
        onChange({
            ...exercise,
            mode: 'time',
            value: n,
        });
    };

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

            <Text style={st.subLabel}>Duration (sec)</Text>
            <Stepper
                label="Duration"
                value={exercise.value}
                onChange={setDurationSec}
                min={1}
                step={5}
            />
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
