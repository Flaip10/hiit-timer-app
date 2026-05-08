import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import type { RunLayoutMode } from '../../hooks/useRunLayoutMode';

interface RunTopSectionStyleProps {
    layoutMode: RunLayoutMode;
}

const spacingFor = (mode: RunLayoutMode) => {
    if (mode === 'minimal') {
        return {
            mainPaddingTop: 6,
            pageGap: 6,
            blockHeaderGap: 2,
            bottomGap: 6,
        };
    }

    if (mode === 'compact') {
        return {
            mainPaddingTop: 6,
            pageGap: 8,
            blockHeaderGap: 4,
            bottomGap: 8,
        };
    }

    return {
        mainPaddingTop: 12,
        pageGap: 12,
        blockHeaderGap: 6,
        bottomGap: 12,
    };
};

export const useRunTopSectionStyles = createStyles(
    (theme: AppTheme, props: RunTopSectionStyleProps) => {
        const spacing = spacingFor(props.layoutMode);

        return StyleSheet.create({
            mainContainer: {
                width: '100%',
                paddingTop: spacing.mainPaddingTop,
                justifyContent: 'flex-start',
            },

            pageHeader: {
                gap: spacing.pageGap,
                paddingHorizontal: 12,
            },

            upperRowContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: 10,
            },

            bottomRowContainer: {
                gap: spacing.bottomGap,
            },

            rowContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
            },

            // icon + text rows
            titleRow: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
            },
            headerIcon: {
                marginRight: 2,
            },

            runWorkoutTitle: {
                color: theme.palette.text.primary,
                fontWeight: '700',
                letterSpacing: 0.2,
            },

            // Workout Timer
            workoutTimerContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            },

            workoutTimerIcon: {
                marginRight: 4,
            },

            workoutTimerText: {
                color: theme.palette.text.primary,
                fontWeight: '700',
                textAlign: 'left',
            },

            // Finished meta row
            finishedMetaRow: {
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
            },

            finishedMetaItem: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: theme.palette.background.card,
                borderWidth: 1,
                borderColor: theme.palette.border.subtle,
            },

            finishedMetaIcon: {
                marginRight: 4,
            },

            finishedMetaText: {
                color: theme.palette.text.muted,
                fontWeight: '500',
            },

            blockHeaderRow: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: spacing.blockHeaderGap,
            },
            blockHeaderLabel: {
                textTransform: 'uppercase',
                letterSpacing: 0.8,
            },
            workoutNameSecondary: {
                color: theme.palette.text.muted,
            },
        });
    },
);
