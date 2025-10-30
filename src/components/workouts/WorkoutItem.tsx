import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Workout } from '@core/entities';
import {
    summarizeWorkout,
    formatWorkoutDuration,
} from '@core/workouts/summarizeWorkout';

export const WorkoutItem = ({
    item,
    onPress,
    onEdit,
    onRemove,
}: {
    item: Workout;
    onPress: () => void;
    onEdit: () => void;
    onRemove: () => void;
}) => {
    const sum = useMemo(() => summarizeWorkout(item), [item]);

    const timeLabel =
        sum.approxSec > 0
            ? `~${formatWorkoutDuration(sum.approxSec)}`
            : sum.hasReps
              ? 'mixed'
              : '—';

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [st.card, pressed && st.pressed]}
        >
            <View style={{ flex: 1 }}>
                <Text style={st.title}>{item.name}</Text>
                <Text style={st.sub}>
                    {sum.blocks} block{sum.blocks !== 1 ? 's' : ''} •{' '}
                    {sum.exercises} exercise{sum.exercises !== 1 ? 's' : ''} •{' '}
                    {timeLabel}
                </Text>
            </View>
            <View style={st.row}>
                <Pressable
                    onPress={onEdit}
                    style={({ pressed }) => [
                        st.smallBtn,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.smallBtnText}>Edit</Text>
                </Pressable>
                <Pressable
                    onPress={onRemove}
                    style={({ pressed }) => [
                        st.smallDanger,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.smallDangerText}>Remove</Text>
                </Pressable>
            </View>
        </Pressable>
    );
};

const st = StyleSheet.create({
    card: {
        backgroundColor: '#111113',
        borderRadius: 12,
        borderColor: '#1F1F23',
        borderWidth: 1,
        padding: 12,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    pressed: {
        opacity: 0.9,
    },
    title: {
        color: '#F2F2F2',
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 2,
    },
    sub: {
        color: '#A1A1AA',
        fontSize: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 6,
    },
    smallBtn: {
        backgroundColor: '#1F2937',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    smallBtnText: {
        color: '#E5E7EB',
        fontWeight: '600',
    },
    smallDanger: {
        backgroundColor: '#3B0D0D',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    smallDangerText: {
        color: '#FCA5A5',
        fontWeight: '600',
    },
});
