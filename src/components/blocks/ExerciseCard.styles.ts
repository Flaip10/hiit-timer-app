import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useExerciseCardStyles = createStyles((_theme: AppTheme) =>
    StyleSheet.create({
        card: {
            marginTop: 8,
        },
        body: {
            gap: 12,
        },
        durationRow: {
            marginTop: 4,
        },
    })
);
