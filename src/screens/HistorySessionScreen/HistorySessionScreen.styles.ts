import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import { StyleSheet } from 'react-native';

export const useHistorySessionStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        headerRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
        },
        headerContainer: {
            flex: 1,
            gap: 8,
            marginBottom: 4,
        },
        headerTitle: {
            marginBottom: 2,
        },
        headerShareButton: {
            marginTop: -4,
            opacity: 0.7,
        },
        headerDateRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
        },
        headerDateItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        headerIcon: {
            marginTop: 1,
        },

        // Stats overview cards
        overviewRow: {
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
        },
        metricCard: {
            flex: 1,
            minWidth: '30%',
            gap: 4,
        },
        metricLabel: {
            marginBottom: 2,
        },

        // Block cards
        blockCard: {
            gap: 8,
        },
        blockStatsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
        },
        blockStatItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        blockStatLabel: {
            marginRight: 2,
        },

        // Actions section
        actionsContainer: {
            gap: 8,
        },
        linkHint: {
            marginTop: 4,
        },

        // Empty state
        emptyContainer: {
            gap: 12,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 32,
        },
        emptyTitle: {
            marginBottom: 4,
        },

        // Share modal
        shareModalBackdrop: {
            flex: 1,
            backgroundColor: theme.palette.overlay.scrim,
            justifyContent: 'center',
            alignItems: 'center',
        },
        shareModalContent: {
            width: '100%',
            maxWidth: 400,
            gap: 20,
        },
        shareModalCardWrapper: {
            backgroundColor: theme.palette.background.primary,
            borderRadius: 16,
            overflow: 'hidden',
        },
        shareModalButtonsRow: {
            flexDirection: 'row',
            gap: 12,
        },
        shareModalButtonsSpacer: {
            width: 12,
        },
    })
);
