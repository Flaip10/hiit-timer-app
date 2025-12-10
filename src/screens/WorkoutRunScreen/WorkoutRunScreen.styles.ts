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

        // ===== Block pause (between blocks) =====
        blockPauseContainer: {
            width: '100%',
            paddingHorizontal: 24,
            gap: 12,
        },
        blockPauseSummary: {
            gap: 8,
        },
        blockPauseTitle: {
            color: theme.palette.text.primary,
            fontWeight: '600',
        },
        blockPauseRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 8,
        },
        blockPauseSetsPill: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: theme.palette.background.card,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
        },
        blockPauseSetsText: {
            color: theme.palette.text.secondary,
            fontWeight: '500',
        },
        blockPauseExercises: {
            color: theme.palette.text.secondary,
        },
        blockPauseHint: {
            textAlign: 'center',
            color: theme.palette.text.muted,
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

        // ===== Finished header extras (used by FinishedCard etc.) =====
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

        finishedDurationRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
            gap: 6,
        },

        finishedFooterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            flex: 1,
        },

        // Share modal
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
