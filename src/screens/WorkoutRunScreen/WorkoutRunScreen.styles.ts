import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import { colors } from '@src/theme/colors';

export const ARC_SIZE = 280;

const useWorkoutRunStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        arcContainer: {
            marginTop: 25,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 30,
        },

        arcWrapper: {
            width: ARC_SIZE,
            height: ARC_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },

        timer: {
            position: 'absolute',
            color: theme.palette.text.primary,
            fontSize: 96,
            fontVariant: ['tabular-nums'],
        },

        // Empty Run State
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            gap: 8,
        },
        emptyTitle: {
            color: theme.palette.text.primary,
            fontWeight: '700',
            textAlign: 'center',
        },
        emptyText: {
            color: theme.palette.text.muted,
            textAlign: 'center',
            marginTop: 4,
        },

        // Exercises Info
        exerciseInfoContainer: {
            width: '100%',
            marginTop: -50,
            paddingHorizontal: 10,
            paddingVertical: 14,
            gap: 12,
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

        // Page Header
        topRegion: {
            width: '100%',
            paddingTop: 16,
            minHeight: 120,
            justifyContent: 'flex-start',
        },
        pageHeader: {
            gap: 12,
            paddingHorizontal: 16,
        },
        pageHeaderInfoContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        runWorkoutTitle: {
            color: theme.palette.text.primary,
            fontWeight: '700',
            letterSpacing: 0.2,
        },

        footerIconRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingHorizontal: 32,
        },

        footerIconWrapper: {
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
        },

        footerIconLabel: {
            color: theme.palette.text.secondary,
            fontWeight: '700',
        },

        footerFinishedWrapper: {
            width: '100%',
            paddingHorizontal: 16,
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
        footerFinishedButtonPressed: {
            opacity: 0.7,
        },
        footerFinishedText: {
            color: theme.palette.text.inverted,
            fontWeight: '600',
        },

        runHeader: {
            paddingHorizontal: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 10,
        },

        // ===== Finished header =====
        finishedTitle: {
            color: theme.palette.text.primary,
            fontWeight: '700',
            marginBottom: 6,
        },
        finishedSubtitle: {
            color: theme.palette.text.muted,
            fontWeight: '500',
        },
        finishedChipsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
        },
        finishedChip: {
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: theme.palette.background.card,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
        },

        finishedDurationPillContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        finishedDurationPill: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: theme.palette.background.card,
            marginTop: 4,
            justifyContent: 'flex-start',
        },
        finishedDurationRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
            gap: 6,
        },
        finishedDurationText: {
            color: theme.palette.text.primary,
        },

        finishedFooterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            flex: 1,
        },

        shareModalBackdrop: {
            flex: 1,
            backgroundColor: theme.palette.overlay.scrim,
            justifyContent: 'center',
            alignItems: 'center',
        },

        shareModalContent: {
            flex: 1,
            width: '100%',
            backgroundColor: theme.palette.background.primary,
            gap: 16,
            paddingTop: theme.insets.top,
            paddingBottom: theme.insets.bottom,
            justifyContent: 'space-between',
        },

        shareModalCardWrapper: {
            flex: 1,
            justifyContent: 'center',
        },

        shareModalButtonsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },

        shareModalButtonsSpacer: {
            width: 12,
        },
    })
);

export default useWorkoutRunStyles;
