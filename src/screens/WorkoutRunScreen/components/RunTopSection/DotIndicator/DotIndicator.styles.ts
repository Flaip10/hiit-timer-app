import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useDotIndicatorStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },

        // All dots reserve the exact same space.
        dotBase: {
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: theme.palette.background.card,
            borderWidth: 1,
            borderColor: 'transparent',
        },

        // Filled = just change color, not size.
        dotFilled: {
            // color is optionally overridden from props
        },

        // Active = subtle emphasis without changing layout.
        dotActive: {
            borderWidth: 1.5,
        },
    })
);
