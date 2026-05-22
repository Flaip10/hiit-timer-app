import React, { useRef, useState } from 'react';
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
    dismissalKey?: string | number;
    isDismissible?: boolean;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
}

interface DismissedBanner {
    dismissalKey: string | number | undefined;
    message: string;
}

export const ErrorBanner = ({
    message,
    dismissalKey,
    isDismissible = false,
    onClose,
    style,
}: ErrorBannerProps) => {
    const { theme } = useTheme();
    const st = useStyles();
    const [dismissedBanner, setDismissedBanner] =
        useState<DismissedBanner | null>(null);

    const trimmedMessage = message.trim();
    const isDismissed =
        dismissedBanner?.message === trimmedMessage &&
        dismissedBanner.dismissalKey === dismissalKey;
    const isVisible = !!trimmedMessage && !isDismissed;
    const canDismiss = isDismissible || !!onClose;

    const lastMessageRef = useRef('');
    if (trimmedMessage) {
        lastMessageRef.current = trimmedMessage;
    }
    const renderedMessage = lastMessageRef.current;

    const handleClose = () => {
        setDismissedBanner({
            dismissalKey,
            message: trimmedMessage,
        });
        onClose?.();
    };

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

                {canDismiss && (
                    <GuardedPressable onPress={handleClose} hitSlop={12}>
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
