import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useStyles } from './HomeActionTile.styles';

export type HomeActionTileProps = {
    title: string;
    subtitle?: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    variant?: 'primary' | 'secondary';
    onPress: () => void;
};

export const HomeActionTile = ({
    title,
    subtitle,
    icon,
    variant = 'secondary',
    onPress,
}: HomeActionTileProps) => {
    const { theme } = useTheme();
    const st = useStyles({ variant });

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [st.root, pressed && st.pressed]}
        >
            <Ionicons
                name={icon}
                size={variant === 'primary' ? 26 : 22}
                color={
                    variant === 'primary'
                        ? theme.palette.text.inverted
                        : theme.palette.text.primary
                }
            />

            <View style={st.textBlock}>
                <AppText
                    variant={variant === 'primary' ? 'title3' : 'body'}
                    style={st.title}
                >
                    {title}
                </AppText>

                {subtitle ? (
                    <AppText variant="bodySmall" tone="inverted">
                        {subtitle}
                    </AppText>
                ) : null}
            </View>
        </Pressable>
    );
};
