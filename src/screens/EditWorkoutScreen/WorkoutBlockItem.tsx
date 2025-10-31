import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { isRepsPace, isTimePace, type WorkoutBlock } from '@src/core/entities';
import st from './styles';

type WorkoutBlockItemProps = {
    index: number;
    block: WorkoutBlock;
    onEdit: (index: number) => void;
    onRemove: (index: number) => void;
};

export const WorkoutBlockItem = ({
    index,
    block,
    onEdit,
    onRemove,
}: WorkoutBlockItemProps) => {
    const { scheme, exercises, title, defaultPace } = block;

    const paceLabel = isTimePace(defaultPace)
        ? `${defaultPace.workSec}s work`
        : isRepsPace(defaultPace)
          ? `${defaultPace.reps} reps`
          : '';

    return (
        <View style={st.blockCard}>
            <View style={st.blockHeader}>
                <Text style={st.blockTitle}>
                    Block {index + 1}
                    {title ? ` — ${title}` : ''}
                </Text>
            </View>

            <Text style={st.blockInfo}>
                {scheme.sets} sets • {exercises.length} exercises • {paceLabel}
            </Text>

            <View style={st.blockActions}>
                <Pressable onPress={() => onEdit(index)} style={st.smallButton}>
                    <Text style={st.smallText}>Edit</Text>
                </Pressable>
                <Pressable
                    onPress={() => onRemove(index)}
                    style={st.removeButton}
                >
                    <Text style={st.removeText}>Remove</Text>
                </Pressable>
            </View>
        </View>
    );
};
