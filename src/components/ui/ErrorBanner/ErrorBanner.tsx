import React from 'react';
import { View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@src/theme/ThemeProvider';
import { createStyles } from '@src/theme/createStyles';
import { AppText } from '@src/components/ui/Typography/AppText';

type ErrorBannerProps = {
    message: string;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
};

const useStyles = createStyles((theme) => ({
    container: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: theme.palette.feedback.errorBg,
        borderWidth: 1,
        borderColor: theme.palette.feedback.errorBorder,
        marginBottom: 8,
        gap: 8,
        width: '100%',
    },
    textContainer: {
        flex: 1,
    },
}));

export const ErrorBanner = ({ message, onClose, style }: ErrorBannerProps) => {
    const { theme } = useTheme();
    const s = useStyles();

    return (
        <View style={[s.container, style]}>
            <Ionicons
                name="alert-circle"
                size={18}
                color={theme.palette.feedback.errorIcon}
            />

            <View style={s.textContainer}>
                <AppText
                    variant="bodySmall"
                    // if you want to force error color independently of tone:
                    style={{ color: theme.palette.feedback.errorText }}
                >
                    {message}
                </AppText>
            </View>

            {onClose && (
                <Pressable onPress={onClose} hitSlop={8}>
                    <Ionicons
                        name="close"
                        size={16}
                        color={theme.palette.text.muted}
                    />
                </Pressable>
            )}
        </View>
    );
};
