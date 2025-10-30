import { Pressable, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

export const IconButton = ({
    onPress,
    children,
}: {
    onPress: () => void;
    children: ReactNode;
}) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [st.btn, pressed && st.pressed]}
    >
        {children}
    </Pressable>
);

const st = StyleSheet.create({
    btn: {
        height: 36,
        width: 36,
        borderRadius: 10,
        backgroundColor: '#131316',
        borderWidth: 1,
        borderColor: '#1F1F23',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: { opacity: 0.9 },
});
