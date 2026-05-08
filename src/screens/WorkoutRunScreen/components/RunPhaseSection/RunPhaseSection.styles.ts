import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import type { RunLayoutMode } from '../../hooks/useRunLayoutMode';

export const DEFAULT_ARC_SIZE = 280;

interface RunPhaseSectionStyleProps {
    layoutMode: RunLayoutMode;
}

interface RunPhaseSectionMetrics {
    arcSize: number;
    arcContainerPaddingTop: number;
    arcWrapperPaddingTop: number;
    exerciseGap: number;
    timerFontSize: number;
}

export const metricsForRunLayout = (
    mode: RunLayoutMode,
): RunPhaseSectionMetrics => {
    if (mode === 'minimal') {
        return {
            arcSize: 210,
            arcContainerPaddingTop: 6,
            arcWrapperPaddingTop: 22,
            exerciseGap: 6,
            timerFontSize: 68,
        };
    }

    if (mode === 'compact') {
        return {
            arcSize: 240,
            arcContainerPaddingTop: 18,
            arcWrapperPaddingTop: 42,
            exerciseGap: 8,
            timerFontSize: 80,
        };
    }

    return {
        arcSize: DEFAULT_ARC_SIZE,
        arcContainerPaddingTop: 24,
        arcWrapperPaddingTop: 60,
        exerciseGap: 10,
        timerFontSize: 96,
    };
};

export const useRunPhaseSectionStyles = createStyles(
    (theme: AppTheme, props: RunPhaseSectionStyleProps) => {
        const metrics = metricsForRunLayout(props.layoutMode);

        return StyleSheet.create({
            mainContainer: {
                flex: 1,
                width: '100%',
            },

            // ===== Block pause (between blocks) =====
            blockPauseContainer: {
                flex: 1,
                width: '100%',
                paddingHorizontal: 16,
                paddingBottom: 30,
                justifyContent: 'center',
                gap: 16,
            },
            blockPauseHint: {
                textAlign: 'center',
                color: theme.palette.text.muted,
            },

            // ===== Arc + phase content =====
            arcContainer: {
                flex: 1,
                paddingTop: metrics.arcContainerPaddingTop,
                alignItems: 'center',
                justifyContent: 'flex-start',
            },

            arcWrapper: {
                width: metrics.arcSize,
                height: metrics.arcSize,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',

                paddingTop: metrics.arcWrapperPaddingTop,
            },

            timer: {
                position: 'absolute',
                color: theme.palette.text.primary,
                fontSize: metrics.timerFontSize,
                fontVariant: ['tabular-nums'],
                marginTop: metrics.arcWrapperPaddingTop,
            },

            phasePillCompact: {
                paddingVertical: 4,
                paddingHorizontal: 14,
            },

            phasePillTextCompact: {
                fontSize: 14,
            },

            // Exercises Info
            exerciseInfoContainer: {
                width: '100%',
                paddingHorizontal: 10,
                gap: metrics.exerciseGap,
            },

            // Finishing zone
            finishedContainer: {
                flex: 1,
                width: '100%',
                gap: 16,
                justifyContent: 'center',
            },
        });
    },
);
