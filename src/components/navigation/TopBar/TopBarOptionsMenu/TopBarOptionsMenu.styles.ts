import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useTopBarOptionsMenuStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        surface: {
            minWidth: 160,
        },
        option: {
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: theme.palette.background.card,
        },
        optionPressed: {
            opacity: 0.85,
        },
        optionDisabled: {
            opacity: 0.5,
        },
        optionLabel: { flexShrink: 1 },
        optionLabelDestructive: {
            color: theme.palette.feedback.errorText,
        },
    }),
);
