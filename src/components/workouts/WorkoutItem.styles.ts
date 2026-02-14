import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useWorkoutItemStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        summaryContainer: {
            gap: 10,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        title: {
            color: theme.palette.text.primary,
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
        },
    })
);
