import { Pressable } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@src/theme/ThemeProvider';
import { AppTheme } from '@src/theme/theme';
import st from './styles';

type Props = {
    onPress: () => void;
    children: ReactNode;
    background?: keyof AppTheme['palette']['surface'];
};

export const IconButton = ({ onPress, children, background }: Props) => {
    const { theme } = useTheme();

    const bg = background
        ? theme.palette.surface[background]
        : theme.palette.surface.navigation;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                st.btn,
                { backgroundColor: bg },
                pressed && st.pressed,
            ]}
        >
            {children}
        </Pressable>
    );
};
