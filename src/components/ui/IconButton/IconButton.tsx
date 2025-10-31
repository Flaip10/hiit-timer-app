import { Pressable } from 'react-native';
import { ReactNode } from 'react';
import st from './styles';

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
