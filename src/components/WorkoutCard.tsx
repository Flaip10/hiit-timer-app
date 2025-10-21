import { memo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';

export type WorkoutCardProps = {
    title: string;
    subtitle?: string;
    onPress: () => void;
    onMore?: () => void;
};

export const WorkoutCard = memo(
    ({ title, subtitle, onPress, onMore }: WorkoutCardProps) => (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [s.card, pressed && s.pressed]}
        >
            <View style={s.row}>
                <Text style={s.title}>{title}</Text>
                {onMore && (
                    <Pressable
                        onPress={onMore}
                        hitSlop={12}
                        style={({ pressed }) => pressed && s.morePressed}
                    >
                        <Text style={s.more}>⋯</Text>
                    </Pressable>
                )}
            </View>
            {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        </Pressable>
    )
);

const s = StyleSheet.create({
    card: {
        backgroundColor: '#131316',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1F1F23',
        marginBottom: 12,
    },
    pressed: { opacity: 0.95 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: { color: '#F2F2F2', fontSize: 16, fontWeight: '700' },
    subtitle: { color: '#A1A1AA', marginTop: 6, fontSize: 12 },
    more: {
        color: '#A1A1AA',
        fontSize: 20,
        lineHeight: 20,
        paddingHorizontal: 4,
    },
    morePressed: { opacity: 0.6 },
});
