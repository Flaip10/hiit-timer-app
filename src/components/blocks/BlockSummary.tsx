import { StyleSheet, Text, View } from 'react-native';
import type { WorkoutBlock } from '../../core/entities';

export const BlockSummary = ({
    block,
    index,
}: {
    block: WorkoutBlock;
    index: number;
}) => (
    <View style={st.wrap}>
        <Text style={st.title}>
            Block {index + 1}
            {block.title ? ` — ${block.title}` : ''}
        </Text>

        <View style={st.grid}>
            <Text style={st.line}>
                Sets: <Text style={st.mono}>{block.sets}</Text>
            </Text>

            <Text style={st.line}>
                Exercises: <Text style={st.mono}>{block.exercises.length}</Text>
            </Text>

            <Text style={st.line}>
                Rest / set:{' '}
                <Text style={st.mono}>{block.restBetweenSetsSec}s</Text>
            </Text>

            <Text style={st.line}>
                Rest / exercise:{' '}
                <Text style={st.mono}>{block.restBetweenExercisesSec}s</Text>
            </Text>
        </View>
    </View>
);

const st = StyleSheet.create({
    wrap: { gap: 8 },
    title: { color: '#E5E7EB', fontWeight: '700', fontSize: 16 },
    grid: { gap: 4 },
    line: { color: '#E5E7EB' },
    mono: { color: '#E5E7EB', fontVariant: ['tabular-nums'] },
});
