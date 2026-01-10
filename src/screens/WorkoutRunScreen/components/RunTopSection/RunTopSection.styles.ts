import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useRunTopSectionStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        mainContainer: {
            width: '100%',
            paddingTop: 16,
            justifyContent: 'flex-start',
        },

        pageHeader: {
            gap: 12,
            paddingHorizontal: 12,
        },

        upperRowContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 10,
        },

        bottomRowContainer: {
            gap: 12,
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
            gap: 6,
        },
        blockHeaderLabel: {
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },
        workoutNameSecondary: {
            color: theme.palette.text.muted,
        },
    })
);
