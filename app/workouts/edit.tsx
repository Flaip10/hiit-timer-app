import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState, useEffect } from 'react';

const EditWorkoutScreen = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const [name, setName] = useState('');

    useEffect(() => {
        id ? setName('Edit: ' + id) : setName('');
    }, [id]);

    return (
        <View style={s.container}>
            <Text style={s.h1}>{id ? 'Edit Workout' : 'New Workout'}</Text>

            <Text style={s.label}>Name</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Lower Body A"
                placeholderTextColor="#6B7280"
                style={s.input}
            />

            <View style={{ height: 12 }} />
            <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                    s.primary,
                    pressed && { opacity: 0.9 },
                ]}
            >
                <Text style={s.primaryText}>Save</Text>
            </Pressable>
        </View>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C', padding: 16 },
    h1: { color: '#F2F2F2', fontSize: 22, fontWeight: '700', marginBottom: 12 },
    label: { color: '#A1A1AA', marginBottom: 6 },
    input: {
        backgroundColor: '#131316',
        color: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
    },
    primary: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryText: { color: '#fff', fontWeight: '700' },
});

export default EditWorkoutScreen;
