import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles(
    (theme: AppTheme, { variant }: { variant: 'primary' | 'secondary' }) =>
        StyleSheet.create({
            root: {
                borderRadius: theme.layout.tile.borderRadius,
                padding: 16,
                backgroundColor:
                    variant === 'primary'
                        ? theme.palette.accent.primary
                        : theme.palette.background.card,
                justifyContent: 'space-between',
                gap: 16,
            },

            pressed: {
                opacity: 0.9,
            },

            textBlock: {
                gap: 4,
            },

            title: {
                color:
                    variant === 'primary'
                        ? theme.palette.text.inverted
                        : theme.palette.text.primary,
            },
        })
);
