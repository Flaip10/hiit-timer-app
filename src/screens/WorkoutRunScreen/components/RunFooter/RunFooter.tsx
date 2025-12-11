import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useRunFooterStyles } from './RunFooter.styles';
import { HoldToConfirmButton } from '@src/components/ui/HoldToConfirmButton/HoldToConfirmButton';
import { Button } from '@src/components/ui/Button/Button';

type RunFooterProps = {
    isFinished: boolean;
    phaseColor: string;
    running: boolean;
    primaryLabel: string;
    onPrimary: () => void;
    onSkip: () => void;
    onRequestEnd: () => void;
    onDone: () => void;

    // new: block-pause behaviour
    isBlockPause: boolean;
    holdToContinueSeconds?: number;
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
    holdToContinueSeconds = 1.2,
}: RunFooterProps) => {
    const st = useRunFooterStyles();
    const { theme } = useTheme();

    // Finished → back button only
    if (isFinished) {
        return (
            <View style={st.footerFinishedWrapper}>
                <Button
                    title="Back to summary"
                    onPress={onDone}
                    variant="primary"
                    // style={st.footerFinishedButton}
                />
            </View>
        );
    }

    // Block pause → hold button replaces the 3 actions
    if (isBlockPause) {
        return (
            <View style={st.footerHoldWrapper}>
                <HoldToConfirmButton
                    title="Hold to start block"
                    variant="primary"
                    holdDurationMs={1200}
                    onConfirmed={onPrimary} // or a dedicated "continueBlock" handler
                />
            </View>
        );
    }

    // Normal running / paused → End, Play/Pause, Skip
    return (
        <View style={st.footerIconRow}>
            {/* End button (with confirm) */}
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

            {/* Main play/pause button */}
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

            {/* Skip button */}
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
