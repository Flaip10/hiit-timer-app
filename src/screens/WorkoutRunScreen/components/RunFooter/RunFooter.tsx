import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useRunFooterStyles } from './RunFooter.styles';
import { HoldToConfirmButton } from '@src/components/ui/HoldToConfirmButton/HoldToConfirmButton';
import { Button } from '@src/components/ui/Button/Button';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';

type RunFooterProps = {
    isFinished: boolean;

    // Timer state
    running: boolean;
    primaryLabel: 'Start' | 'Pause' | 'Resume' | 'Continue' | 'Done';

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

    return (
        <>
            <AppearingView
                visible={isFinished}
                style={st.footerFinishedWrapper}
                delay={260}
            >
                <Button
                    title="Back to summary"
                    onPress={onDone}
                    variant="primary"
                />
            </AppearingView>
            <AppearingView
                visible={!isFinished && isBlockPause}
                delay={260}
                style={st.footerHoldWrapper}
            >
                <HoldToConfirmButton
                    title="Hold to start Block"
                    variant="primary"
                    holdDurationMs={holdToContinueMs}
                    onConfirmed={onPrimary}
                />
            </AppearingView>

            <AppearingView
                visible={!isFinished && !isBlockPause}
                style={st.footerIconRow}
                delay={260}
            >
                <View style={st.footerIconWrapper}>
                    <CircleIconButton
                        onPress={onRequestEnd}
                        variant="secondary"
                        disabled={isBlockPause}
                    >
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
                        disabled={isBlockPause}
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
                    <CircleIconButton
                        onPress={onSkip}
                        variant="secondary"
                        disabled={isBlockPause}
                    >
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
            </AppearingView>
        </>
    );
};

export default RunFooter;
