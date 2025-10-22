import { StyleSheet, Text, View } from 'react-native';
import type { WorkoutBlock, Pace } from '../../core/entities';
import { isTimePace } from '../../core/entities';

const describeDefaultPace = (p: Pace): string =>
    isTimePace(p)
        ? `Time • ${p.workSec}s`
        : `Reps • ${p.reps}${p.tempo ? ` @ ${p.tempo}` : ''}`;

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
                Sets: <Text style={st.mono}>{block.scheme.sets}</Text>
            </Text>
            <Text style={st.line}>
                # Exercises:{' '}
                <Text style={st.mono}>{block.exercises.length}</Text>
            </Text>
            <Text style={st.line}>
                Rest / set:{' '}
                <Text style={st.mono}>{block.scheme.restBetweenSetsSec}s</Text>
            </Text>
            <Text style={st.line}>
                Rest / exercise:{' '}
                <Text style={st.mono}>
                    {block.scheme.restBetweenExercisesSec}s
                </Text>
            </Text>
            <Text style={st.line}>
                Default:{' '}
                <Text style={st.mono}>
                    {describeDefaultPace(block.defaultPace)}
                </Text>
            </Text>
            <Text style={st.line}>
                Advanced:{' '}
                <Text style={st.mono}>{block.advanced ? 'On' : 'Off'}</Text>
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
