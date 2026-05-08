import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { useRunFooterStyles } from './RunFooter.styles';
import { HoldToConfirmButton } from '@src/components/ui/HoldToConfirmButton/HoldToConfirmButton';
import { Button } from '@src/components/ui/Button/Button';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { useTranslation } from 'react-i18next';
import { useRunLayout } from '../../context/RunLayoutContext';

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
    onShare: () => void;

    // Block pause behaviour
    isBlockPause: boolean;
    holdToContinueMs?: number;
};

interface PrimaryActionKeyMap {
    Start: 'run.actions.start';
    Pause: 'run.actions.pause';
    Resume: 'run.actions.resume';
    Continue: 'run.actions.continue';
    Done: 'run.actions.done';
}

export const RunFooter = ({
    isFinished,
    phaseColor,
    running,
    primaryLabel,
    onPrimary,
    onSkip,
    onRequestEnd,
    onDone,
    onShare,
    isBlockPause,
    holdToContinueMs = 1000,
}: RunFooterProps) => {
    const { t } = useTranslation();
    const { mode } = useRunLayout();
    const st = useRunFooterStyles({ layoutMode: mode });
    const { theme } = useTheme();
    const secondaryButtonSize = mode === 'minimal' ? 46 : 56;
    const primaryButtonSize =
        mode === 'minimal' ? 60 : mode === 'compact' ? 68 : 76;
    const secondaryIconSize = mode === 'minimal' ? 20 : 22;
    const primaryIconSize =
        mode === 'minimal' ? 26 : mode === 'compact' ? 28 : 30;

    const shareIcon = (
        <AppIcon id="share" size={18} color={theme.palette.text.inverted} />
    );
    const primaryLabelKeyByValue: PrimaryActionKeyMap = {
        Start: 'run.actions.start',
        Pause: 'run.actions.pause',
        Resume: 'run.actions.resume',
        Continue: 'run.actions.continue',
        Done: 'run.actions.done',
    };

    return (
        <>
            <AppearingView
                visible={isFinished}
                style={st.footerFinishedWrapper}
                delay={260}
            >
                <Button
                    title={t('run.actions.backToHome')}
                    onPress={onDone}
                    variant="secondary"
                    flex={1}
                />
                <Button
                    title={t('common.actions.share')}
                    onPress={onShare}
                    variant="primary"
                    icon={shareIcon}
                    flex={1}
                />
            </AppearingView>
            <AppearingView
                visible={!isFinished && isBlockPause}
                delay={260}
                style={st.footerHoldWrapper}
            >
                <HoldToConfirmButton
                    title={t('run.actions.holdToStartBlock')}
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
                        size={secondaryButtonSize}
                        disabled={isBlockPause}
                    >
                        <Ionicons
                            name="stop"
                            size={secondaryIconSize}
                            color={theme.palette.button.text.secondary}
                        />
                    </CircleIconButton>
                    <AppText variant="caption" style={st.footerIconLabel}>
                        {t('run.actions.end')}
                    </AppText>
                </View>

                <View style={st.footerIconWrapper}>
                    <CircleIconButton
                        onPress={onPrimary}
                        variant="primary"
                        backgroundColor={phaseColor}
                        size={primaryButtonSize}
                        disabled={isBlockPause}
                    >
                        <Ionicons
                            name={running ? 'pause' : 'play'}
                            size={primaryIconSize}
                            color={theme.palette.text.inverted}
                        />
                    </CircleIconButton>
                    <AppText variant="caption" style={st.footerIconLabel}>
                        {t(primaryLabelKeyByValue[primaryLabel])}
                    </AppText>
                </View>

                <View style={st.footerIconWrapper}>
                    <CircleIconButton
                        onPress={onSkip}
                        variant="secondary"
                        size={secondaryButtonSize}
                        disabled={isBlockPause}
                    >
                        <Ionicons
                            name="play-skip-forward"
                            size={secondaryIconSize}
                            color={theme.palette.button.text.secondary}
                        />
                    </CircleIconButton>
                    <AppText variant="caption" style={st.footerIconLabel}>
                        {t('run.actions.skip')}
                    </AppText>
                </View>
            </AppearingView>
        </>
    );
};

export default RunFooter;
