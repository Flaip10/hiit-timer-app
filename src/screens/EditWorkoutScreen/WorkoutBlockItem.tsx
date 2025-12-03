import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { WorkoutBlock } from '@src/core/entities';
import st from './styles';

type WorkoutBlockItemProps = {
    index: number; // Only for label purposes
    block: WorkoutBlock;
    onEdit: (id: string) => void;
    onRemove: (id: string) => void;
};

export const WorkoutBlockItem = ({
    index,
    block,
    onEdit,
    onRemove,
}: WorkoutBlockItemProps) => {
    const { sets, exercises, title } = block;

    const exerciseSummary = (() => {
        if (exercises.length === 0) return '';

        const first = exercises[0];
        const allSame = exercises.every(
            (ex) => ex.mode === first.mode && ex.value === first.value
        );

        if (!allSame) return '';

        if (first.mode === 'time') {
            return `${first.value}s each`;
        }

        // reps mode (kept for future use even if run-logic ignores reps for now)
        return `${first.value} reps each`;
    })();

    const metaParts = [
        `${sets} ${sets === 1 ? 'set' : 'sets'}`,
        `${exercises.length} ${exercises.length === 1 ? 'exercise' : 'exercises'}`,
    ];

    if (exerciseSummary) {
        metaParts.push(exerciseSummary);
    }

    return (
        <View style={st.blockCard}>
            <View style={st.blockHeader}>
                <Text style={st.blockTitle}>
                    Block {index + 1}
                    {title ? ` — ${title}` : ''}
                </Text>
            </View>

            <Text style={st.blockInfo}>{metaParts.join(' • ')}</Text>

            <View style={st.blockActions}>
                <Pressable
                    onPress={() => onEdit(block.id)}
                    style={({ pressed }) => [
                        st.smallButton,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.smallText}>Edit</Text>
                </Pressable>

                <Pressable
                    onPress={() => onRemove(block.id)}
                    style={({ pressed }) => [
                        st.removeButton,
                        pressed && st.pressed,
                    ]}
                >
                    <Text style={st.removeText}>Remove</Text>
                </Pressable>
            </View>
        </View>
    );
};
