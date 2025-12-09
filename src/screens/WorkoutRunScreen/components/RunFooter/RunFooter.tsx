import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppText } from '@src/components/ui/Typography/AppText';
import useWorkoutRunStyles from '../../WorkoutRunScreen.styles';
import { useTheme } from '@src/theme/ThemeProvider';

type RunFooterProps = {
    isFinished: boolean;
    phaseColor: string;
    running: boolean;
    primaryLabel: string;
    onPrimary: () => void;
    onSkip: () => void;
    onRequestEnd: () => void;
    onDone: () => void;
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
}: RunFooterProps) => {
    const st = useWorkoutRunStyles();
    const { theme } = useTheme();

    if (isFinished) {
        return (
            <View style={st.footerFinishedWrapper}>
                <Pressable
                    onPress={onDone}
                    style={({ pressed }) =>
                        pressed
                            ? [
                                  st.footerFinishedButton,
                                  st.footerFinishedButtonPressed,
                              ]
                            : [st.footerFinishedButton]
                    }
                >
                    <AppText variant="subtitle" style={st.footerFinishedText}>
                        Back to summary
                    </AppText>
                </Pressable>
            </View>
        );
    }

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
