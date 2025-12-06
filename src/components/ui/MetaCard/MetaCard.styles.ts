import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import { AppTheme } from '@src/theme/theme';

type MetaCardStyleProps = {
    hasActionStrip: boolean;
};

export const useMetaCardStyles = createStyles(
    (theme: AppTheme, props: MetaCardStyleProps) =>
        StyleSheet.create({
            cardContainer: {
                backgroundColor: theme.palette.metaCard.container.background,
                borderRadius: 14,
                padding: 14,
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: theme.palette.metaCard.container.border,
                gap: 10,
            },
            cardContainerNoTopContent: {
                gap: 14,
            },

            cardHeader: {
                marginTop: -14,
                marginLeft: -14,
                flexDirection: 'row',
                alignItems: 'center',
            },

            topLeftContainer: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                borderTopLeftRadius: 14,
                borderBottomRightRadius: 14,
                padding: 0,
                marginRight: 50,
            },
            topLeftContainerNoAction: {
                marginRight: 0,
            },

            dateTimePill: {
                backgroundColor: theme.palette.accent.surfaces,
                borderTopLeftRadius: 14,
                borderBottomRightRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 2,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderColor: theme.palette.border.subtle,
                marginRight: 4,
            },
            dateTimePillText: {
                color: theme.palette.text.inverted,
                fontSize: 13,
                fontWeight: '700',
            },

            topLeftContent: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor:
                    theme.palette.metaCard.topLeftContent.background,
                borderTopLeftRadius: 14,
                borderBottomRightRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 2,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderColor: theme.palette.metaCard.topLeftContent.border,
                maxWidth: '100%',
                marginRight: 4,
                position: 'relative',
                zIndex: 2,
            },
            topLeftContentText: {
                color: theme.palette.metaCard.topLeftContent.text,
                fontSize: 13,
                fontWeight: '700',
            },

            statusBadgeContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                position: 'relative',
                zIndex: 1,
            },
            statusBadge: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingTop: 2,
                paddingBottom: 3,
                paddingHorizontal: 18,
                borderBottomRightRadius: 14,
                marginLeft: -14,
                overflow: 'hidden',
                backgroundColor: theme.palette.metaCard.statusBadge.background,
            },
            statusBadgeText: {
                fontSize: 13,
                fontWeight: '700',
                color: theme.palette.metaCard.statusBadge.text,
            },

            actionButtonsContainer: {
                position: 'absolute',
                top: 0,
                right: -14,
                flexDirection: 'row',
                justifyContent: 'center',
                paddingHorizontal: 9,
                paddingVertical: 0,
                backgroundColor: theme.palette.metaCard.actionButton.background,
                borderBottomLeftRadius: 14,
                borderBottomWidth: 1,
                borderLeftWidth: 1,
                borderColor: theme.palette.metaCard.actionButton.border,
                gap: 8,
            },

            actionButton: {
                height: 35,
                minWidth: 35,
                paddingHorizontal: 10,
                alignItems: 'center',
                justifyContent: 'center',
                borderBottomLeftRadius: 14,
            },

            contentContainer: {
                flexDirection: 'row',
                paddingRight: 0,
            },
            contentContainerExpandable: {
                paddingRight: 28,
            },
            contentInner: {
                flex: 1,
            },

            imageContainer: {
                flexShrink: 0,
                alignSelf: 'flex-start',
                width: 54,
                height: 54,
                borderRadius: 8,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: theme.palette.border.subtle,
                marginRight: 10,
            },
            image: {
                width: 54,
                height: 54,
            },

            expandIconWrapper: {
                position: 'absolute',
                bottom: 10,
                right: props.hasActionStrip ? 35 : 10,
                width: 24,
                height: 24,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
            },
        })
);
