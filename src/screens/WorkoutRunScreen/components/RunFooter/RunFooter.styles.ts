import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import { colors } from '@src/theme/colors';
import type { RunLayoutMode } from '../../hooks/useRunLayoutMode';

interface RunFooterStyleProps {
    layoutMode: RunLayoutMode;
}

const footerMetricsFor = (mode: RunLayoutMode) => {
    if (mode === 'minimal') {
        return {
            rowPaddingHorizontal: 24,
            wrapperGap: 4,
        };
    }

    if (mode === 'compact') {
        return {
            rowPaddingHorizontal: 28,
            wrapperGap: 6,
        };
    }

    return {
        rowPaddingHorizontal: 32,
        wrapperGap: 8,
    };
};

export const useRunFooterStyles = createStyles(
    (theme: AppTheme, props: RunFooterStyleProps) => {
        const metrics = footerMetricsFor(props.layoutMode);

        return StyleSheet.create({
        footerIconRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingHorizontal: metrics.rowPaddingHorizontal,
        },

        footerIconWrapper: {
            alignItems: 'center',
            justifyContent: 'center',
            gap: metrics.wrapperGap,
        },

        footerIconLabel: {
            color: theme.palette.text.secondary,
            fontWeight: '700',
        },

        // Finished state
        footerFinishedWrapper: {
            width: '100%',
            flexDirection: 'row',
            gap: 12,
        },
        footerFinishedButton: {
            width: '100%',
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.button.primary,
            shadowColor: colors.black.main,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
        },

        // Block pause footer (only hold button)
        footerHoldWrapper: {
            width: '100%',
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
        },
        footerHoldLabel: {
            color: theme.palette.text.secondary,
            fontWeight: '600',
            textAlign: 'center',
        },
        });
    }
);
