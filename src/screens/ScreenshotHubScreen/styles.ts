import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useScreenshotHubStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        intro: {
            gap: 8,
        },
        introTitle: {},
        introBody: {
            maxWidth: 560,
        },
        list: {
            gap: 12,
            paddingBottom: theme.insets.bottom,
        },
        card: {
            gap: 10,
            padding: theme.layout.card.padding,
            borderRadius: theme.layout.card.borderRadius,
            backgroundColor: theme.palette.background.card,
        },
        cardHeader: {
            gap: 4,
        },
        cardTitle: {},
        cardDescription: {},
    })
);
