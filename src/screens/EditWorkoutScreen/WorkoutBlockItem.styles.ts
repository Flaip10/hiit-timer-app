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
        blockInfoText: {
            // AppText handles color; this is spacing only
        },

        exercisesContainer: {
            marginTop: 8,
            gap: 6,
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
            flex: 1,
        },
        exerciseName: {
            // AppText variant handles size/weight; small vertical spacing
        },
        exerciseMeta: {
            marginTop: 2,
        },
    })
);
