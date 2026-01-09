import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useFieldLabelStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        iconWrapper: {
            width: 18,
            height: 18,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.fieldLabel.iconBackground,
        },
        text: {
            color: theme.palette.text.muted,
            fontSize: 13,
            fontWeight: '500',
        },
    })
);
