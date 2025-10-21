import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const RunScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    return (
        <View style={s.container}>
            <Text style={s.h1}>Run</Text>
            <Text style={s.sub}>Workout ID: {id}</Text>

            <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [s.btn, pressed && { opacity: 0.9 }]}
            >
                <Text style={s.btnText}>Back</Text>
            </Pressable>
        </View>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C', padding: 16, gap: 12 },
    h1: { color: '#F2F2F2', fontSize: 24, fontWeight: '700' },
    sub: { color: '#A1A1AA' },
    btn: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    btnText: { color: '#fff', fontWeight: '700' },
});

export default RunScreen;
