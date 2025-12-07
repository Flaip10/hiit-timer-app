import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useFieldLabelStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        iconWrapper: {
            width: 18,
            height: 18,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.accent.soft,
        },
        icon: {
            // color comes from icon prop, this is just a placeholder if needed
        },
        text: {
            color: theme.palette.text.muted,
            fontSize: 13,
            fontWeight: '500',
        },
    })
);
