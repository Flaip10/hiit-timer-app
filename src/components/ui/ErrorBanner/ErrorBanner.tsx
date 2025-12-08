import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@src/theme/ThemeProvider';
import { createStyles } from '@src/theme/createStyles';
import { AppText } from '@src/components/ui/Typography/AppText';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import MinHeightCollapse from '../MinHeightCollapse/MinHeightCollapse';

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
        padding: theme.layout.card.padding,
        borderRadius: theme.layout.card.borderRadius,
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
    dismissRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 4,
    },
}));

export const ErrorBanner = ({ message, onClose, style }: ErrorBannerProps) => {
    const { theme } = useTheme();
    const st = useStyles();

    const ANIMATION_DURATION = 150;
    const EXIT_DURATION = 150;

    const [visible, setVisible] = useState<boolean>(!!message.trim());
    const [expanded, setExpanded] = useState<boolean>(!!message.trim());

    const hideTimeoutRef = useRef<number | null>(null);

    const clearHideTimeout = () => {
        if (hideTimeoutRef.current != null) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearHideTimeout();
        };
    }, []);

    // React to message changes from parent
    useEffect(() => {
        const hasMessage = !!message.trim();

        clearHideTimeout();

        if (hasMessage) {
            // New / updated errors → show and expand immediately
            setExpanded(true);
            setVisible(true);
        } else {
            // Parent cleared message entirely → fade out then collapse
            setVisible(false);
            hideTimeoutRef.current = setTimeout(() => {
                setExpanded(false);
            }, EXIT_DURATION) as unknown as number;
        }
    }, [message, EXIT_DURATION]);

    const handleClose = () => {
        // Local dismiss: fade out + delayed collapse
        clearHideTimeout();
        setVisible(false);

        hideTimeoutRef.current = setTimeout(() => {
            setExpanded(false);
        }, EXIT_DURATION) as unknown as number;

        onClose?.();
    };

    return (
        <MinHeightCollapse
            expanded={expanded}
            minHeight={0}
            timeout={EXIT_DURATION}
            withBottomFade={false}
        >
            <AppearingView
                visible={visible}
                offsetY={8}
                duration={ANIMATION_DURATION}
                delay={EXIT_DURATION}
            >
                <View style={[st.container, style]}>
                    <Ionicons
                        name="alert-circle"
                        size={18}
                        color={theme.palette.feedback.errorIcon}
                    />

                    <View style={st.textContainer}>
                        <AppText
                            variant="bodySmall"
                            style={{ color: theme.palette.feedback.errorText }}
                        >
                            {message}
                        </AppText>
                    </View>

                    {onClose && (
                        <Pressable onPress={handleClose} hitSlop={8}>
                            <View style={st.dismissRow}>
                                <Ionicons
                                    name="close"
                                    size={16}
                                    color={theme.palette.text.muted}
                                />
                                <AppText variant="caption" tone="muted">
                                    Dismiss
                                </AppText>
                            </View>
                        </Pressable>
                    )}
                </View>
            </AppearingView>
        </MinHeightCollapse>
    );
};
