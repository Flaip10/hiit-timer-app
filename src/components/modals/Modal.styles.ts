import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useModalStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.palette.overlay.scrim,
        },
        backdropPress: {
            flex: 1,
        },
        centerWrap: {
            flex: 1,
            justifyContent: 'center',
            padding: 20,
        },
        sheet: {
            backgroundColor: theme.palette.background.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            padding: 16,
            shadowColor: theme.palette.background.primary,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
        },
    })
);
