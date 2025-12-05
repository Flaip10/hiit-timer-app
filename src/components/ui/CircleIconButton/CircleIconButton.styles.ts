import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useCircleIconButtonStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        primaryCircle: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.accent.surfaces,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 8,
        },

        secondaryCircle: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.button.secondary,
        },
    })
);
