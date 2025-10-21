import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const Screen = ({ children }: { children: ReactNode }) => (
    <View style={s.screen}>{children}</View>
);
export const Title = ({ children }: { children: ReactNode }) => (
    <Text style={s.title}>{children}</Text>
);
export const Subtitle = ({ children }: { children: ReactNode }) => (
    <Text style={s.subtitle}>{children}</Text>
);

export const PrimaryButton = ({
    title,
    onPress,
}: {
    title: string;
    onPress: () => void;
}) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
    >
        <Text style={s.btnText}>{title}</Text>
    </Pressable>
);

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#0B0B0C', padding: 16, gap: 16 },
    title: { color: '#F2F2F2', fontSize: 28, fontWeight: '700' },
    subtitle: { color: '#A1A1AA', fontSize: 14 },
    btn: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnPressed: { opacity: 0.9 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
