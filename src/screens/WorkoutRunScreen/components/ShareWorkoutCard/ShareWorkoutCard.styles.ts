import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useShareWorkoutCardStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        mainWrapper: {
            flex: 1,
            borderRadius: 24,
            aspectRatio: 0.56,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '100%',
        },
        cardContainer: {
            flex: 1,
            aspectRatio: 0.56, // share-friendly 9/16
            maxWidth: '100%',
            padding: 20,
            paddingTop: 80,
            gap: 14,
            backgroundColor: theme.palette.background.primary,
            justifyContent: 'space-between',
            position: 'relative',
        },

        cardWatermark: {
            paddingTop: 60,
        },

        // HEADER
        cardHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        cardHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        cardAppName: {
            color: theme.palette.text.muted,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: '600',
        },
        cardDurationPill: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: theme.palette.background.card,
        },
        cardDurationIcon: {
            marginRight: 4,
        },
        cardDurationText: {
            color: theme.palette.text.primary,
            fontWeight: '500',
        },

        // CENTER SECTION
        centerSection: {
            flex: 1,
            gap: 16,
            justifyContent: 'space-between',
        },

        cardTitleBlock: {
            alignItems: 'flex-start',
            gap: 6,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        cardTitle: {
            color: theme.palette.text.primary,
        },
        fireEmoji: {
            marginTop: -2,
        },
        cardSubtitle: {
            color: theme.palette.text.muted,
        },

        // Overview MetaCard
        metaSummaryWrapper: {
            gap: 8,
        },
        metaSummaryRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
        },
        metaMetric: {
            flex: 1,
        },
        metaMetricWide: {
            flex: 1.3,
        },
        metaMetricLabel: {
            marginBottom: 2,
        },
        metaMetricValue: {
            fontWeight: '600',
        },

        // Blocks list (outside MetaCard)
        blocksList: {
            marginTop: 10,
            gap: 14,
        },
        blockRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
        },
        blockBullet: {
            width: 6,
            height: 6,
            borderRadius: 3,
            marginTop: 6, // align with first line of text
        },
        blockContent: {
            flex: 1,
            gap: 4,
        },
        blockHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        blockTitle: {
            color: theme.palette.text.primary,
            fontWeight: '600',
            flexShrink: 1,
        },
        blockSetsPill: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: theme.palette.background.card,
        },
        blockSetsText: {
            color: theme.palette.text.secondary,
            fontWeight: '500',
        },
        blockExercises: {
            fontSize: 13,
            lineHeight: 18, // improves readability when wrapping
        },

        // FOOTER
        cardFooterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginTop: 8,
        },
        cardFooterIcon: {
            marginRight: 6,
        },
        cardFooterLeft: {
            color: theme.palette.text.muted,
        },
    })
);
