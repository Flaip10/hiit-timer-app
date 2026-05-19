import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useExerciseDefinitionCardStyles = createStyles(
    (theme: AppTheme) =>
        StyleSheet.create({
            summaryContainer: {
                gap: 10,
            },
            title: {
                color: theme.palette.text.primary,
                flexShrink: 1,
            },
            metaRow: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
            },
            metaItem: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                flexShrink: 1,
            },
        }),
);
