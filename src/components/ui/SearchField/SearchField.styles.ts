import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useSearchFieldStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 999,
            paddingRight: 10,
            paddingLeft: 16,
            backgroundColor: theme.palette.background.card,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
        },

        // Opt-in when used inside a row that should be filled
        containerFullWidth: {
            flex: 1,
            height: '100%',
        },

        iconLeft: {
            marginRight: 6,
        },

        input: {
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 0,
            color: theme.palette.text.primary,
            backgroundColor: 'transparent',
        },

        clearHitbox: {
            padding: 4,
            marginLeft: 4,
        },
    })
);
