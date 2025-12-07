import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useWorkoutBlockItemStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        body: {
            gap: 8,
        },
        blockInfoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        exercisesContainer: {
            gap: 10,
        },
        exerciseRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
        },
        exerciseIndexBubble: {
            width: 22,
            height: 22,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.accent.soft,
        },
        exerciseIndexText: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.palette.accent.primary,
        },
        exerciseTexts: {
            gap: 4,
        },
    })
);
