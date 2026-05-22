import React, { useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@src/theme/ThemeProvider';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useStyles } from './ErrorBanner.styles';
import { CollapseFade } from '@src/components/ui/CollapseFade/CollapseFade';
import GuardedPressable from '../GuardedPressable/GuardedPressable';

interface ErrorBannerProps {
    message: string;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const ErrorBanner = ({ message, onClose, style }: ErrorBannerProps) => {
    const { theme } = useTheme();
    const st = useStyles();

    const trimmedMessage = message.trim();
    const isVisible = !!trimmedMessage;

    const lastMessageRef = useRef('');
    if (trimmedMessage) {
        lastMessageRef.current = trimmedMessage;
    }
    const renderedMessage = lastMessageRef.current;

    return (
        <CollapseFade visible={isVisible} duration={150}>
            <View style={[st.container, style]}>
                <Ionicons
                    name="alert-circle"
                    size={18}
                    color={theme.palette.feedback.errorIcon}
                />

                <View style={st.textContainer}>
                    <AppText variant="bodySmall" style={st.messageText}>
                        {renderedMessage}
                    </AppText>
                </View>

                {onClose && (
                    <GuardedPressable onPress={onClose} hitSlop={12}>
                        <Ionicons
                            name="close"
                            size={18}
                            color={theme.palette.text.muted}
                        />
                    </GuardedPressable>
                )}
            </View>
        </CollapseFade>
    );
};
