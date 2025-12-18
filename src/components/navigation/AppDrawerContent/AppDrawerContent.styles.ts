import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles((theme) =>
    StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: theme.palette.background.card,
        },

        header: {
            backgroundColor: theme.palette.accent.primary,
            paddingTop: theme.insets.top,
            paddingHorizontal: 16,
            paddingBottom: 16,
            marginBottom: 14,
            borderBottomRightRadius: 56,
        },

        headerTitle: {
            color: theme.palette.text.inverted,
        },

        headerSubtitle: {
            color: theme.palette.text.inverted,
        },

        listContent: {
            width: '100%',
            gap: 7,
        },

        footerSpacer: {
            height: theme.insets.bottom,
        },
    })
);
