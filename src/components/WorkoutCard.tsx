import { memo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';

export type WorkoutCardProps = {
    title: string;
    subtitle?: string;
    onPress: () => void; // open Run
    onEdit?: () => void; // open Edit
    onRemove?: () => void; // confirm + remove
};

export const WorkoutCard = memo(
    ({ title, subtitle, onPress, onEdit, onRemove }: WorkoutCardProps) => (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [s.card, pressed && s.pressed]}
        >
            <View style={s.row}>
                <Text style={s.title}>{title}</Text>
                <View style={s.actions}>
                    {onEdit && (
                        <Pressable
                            onPress={onEdit}
                            hitSlop={12}
                            style={({ pressed }) => pressed && s.actionPressed}
                        >
                            <Text style={s.actionEdit}>Edit</Text>
                        </Pressable>
                    )}
                    {onRemove && (
                        <Pressable
                            onPress={onRemove}
                            hitSlop={12}
                            style={({ pressed }) => [
                                s.removeBtn,
                                pressed && s.actionPressed,
                            ]}
                        >
                            <Text style={s.actionRemove}>Remove</Text>
                        </Pressable>
                    )}
                </View>
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
    actions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    actionPressed: { opacity: 0.6 },
    actionEdit: { color: '#93C5FD', fontSize: 14, fontWeight: '700' },
    removeBtn: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 8,
        backgroundColor: '#1C1C1F',
    },
    actionRemove: { color: '#FCA5A5', fontSize: 14, fontWeight: '700' },
});
