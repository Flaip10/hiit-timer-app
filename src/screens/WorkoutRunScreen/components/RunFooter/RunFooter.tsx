import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useRunFooterStyles } from './RunFooter.styles';
import { HoldToConfirmButton } from '@src/components/ui/HoldToConfirmButton/HoldToConfirmButton';
import { Button } from '@src/components/ui/Button/Button';

type RunFooterProps = {
    isFinished: boolean;

    // Timer state
    running: boolean;
    primaryLabel: string;

    // UI
    phaseColor: string;

    // Actions
    onPrimary: () => void;
    onSkip: () => void;
    onRequestEnd: () => void;
    onDone: () => void;

    // Block pause behaviour
    isBlockPause: boolean;
    holdToContinueMs?: number;
};

export const RunFooter = ({
    isFinished,
    phaseColor,
    running,
    primaryLabel,
    onPrimary,
    onSkip,
    onRequestEnd,
    onDone,
    isBlockPause,
    holdToContinueMs = 1000,
}: RunFooterProps) => {
    const st = useRunFooterStyles();
    const { theme } = useTheme();

    if (isFinished) {
        return (
            <View style={st.footerFinishedWrapper}>
                <Button
                    title="Back to summary"
                    onPress={onDone}
                    variant="primary"
                />
            </View>
        );
    }

    if (isBlockPause) {
        return (
            <View style={st.footerHoldWrapper}>
                <HoldToConfirmButton
                    title="Hold to start Block"
                    variant="primary"
                    holdDurationMs={holdToContinueMs}
                    onConfirmed={onPrimary}
                />
            </View>
        );
    }

    return (
        <View style={st.footerIconRow}>
            <View style={st.footerIconWrapper}>
                <CircleIconButton onPress={onRequestEnd} variant="secondary">
                    <Ionicons
                        name="stop"
                        size={22}
                        color={theme.palette.button.text.secondary}
                    />
                </CircleIconButton>
                <AppText variant="caption" style={st.footerIconLabel}>
                    End
                </AppText>
            </View>

            <View style={st.footerIconWrapper}>
                <CircleIconButton
                    onPress={onPrimary}
                    variant="primary"
                    backgroundColor={phaseColor}
                    size={76}
                >
                    <Ionicons
                        name={running ? 'pause' : 'play'}
                        size={30}
                        color={theme.palette.text.inverted}
                    />
                </CircleIconButton>
                <AppText variant="caption" style={st.footerIconLabel}>
                    {primaryLabel}
                </AppText>
            </View>

            <View style={st.footerIconWrapper}>
                <CircleIconButton onPress={onSkip} variant="secondary">
                    <Ionicons
                        name="play-skip-forward"
                        size={22}
                        color={theme.palette.button.text.secondary}
                    />
                </CircleIconButton>
                <AppText variant="caption" style={st.footerIconLabel}>
                    Skip
                </AppText>
            </View>
        </View>
    );
};

export default RunFooter;
