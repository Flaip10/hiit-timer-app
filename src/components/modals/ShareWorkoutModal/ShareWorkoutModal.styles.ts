import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useShareWorkoutModalStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        content: {
            flex: 1,
            gap: 16,
            paddingTop: theme.insets.top,
            paddingBottom: theme.insets.bottom,
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonsRow: {
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: theme.layout.screen.padding,
        },
    })
);

