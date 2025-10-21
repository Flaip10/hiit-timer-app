import { Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';

const Home = () => (
    <View
        style={{
            flex: 1,
            backgroundColor: '#0B0B0C',
            padding: 16,
            gap: 16,
            justifyContent: 'center',
        }}
    >
        <Text style={{ color: '#F2F2F2', fontSize: 28, fontWeight: '700' }}>
            Pace
        </Text>
        <Text style={{ color: '#A1A1AA' }}>Minimal training timer.</Text>

        <Link href="/workouts" asChild>
            <Pressable
                style={{
                    backgroundColor: '#2563EB',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}
                >
                    Workouts
                </Text>
            </Pressable>
        </Link>
    </View>
);

export default Home;
