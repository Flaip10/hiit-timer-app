import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkout } from '../../src/state/useWorkouts';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TopBar } from '../../src/components/navigation/TopBar';

export default () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const w = useWorkout(id);

    if (!id || !w) {
        return (
            <View style={st.container}>
                <TopBar title="Workout" />
                <View style={st.content}>
                    <Text style={st.err}>Workout not found.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={st.container}>
            <TopBar title={w.name} />
            <View style={st.content}>
                {/* list blocks, etc. */}
                <Pressable
                    onPress={() => router.push(`/workouts/edit?id=${w.id}`)}
                    style={st.secondary}
                >
                    <Text style={st.secondaryText}>Edit</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.push(`/run?id=${w.id}`)}
                    style={st.primary}
                >
                    <Text style={st.primaryText}>Start</Text>
                </Pressable>
            </View>
        </View>
    );
};

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C' },
    content: { padding: 16, gap: 12 },
    err: { color: '#FCA5A5' },
    primary: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryText: { color: '#fff', fontWeight: '700' },
    secondary: {
        backgroundColor: '#1C1C1F',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    secondaryText: { color: '#E5E7EB', fontWeight: '700' },
});
