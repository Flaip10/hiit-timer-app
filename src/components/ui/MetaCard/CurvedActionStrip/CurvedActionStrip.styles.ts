import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useCurvedActionStripStyles = createStyles((_theme: AppTheme) =>
    StyleSheet.create({
        touchArea: {
            position: 'absolute',
            top: 0,
            right: -14,
            height: 60,
            width: 70,
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
        },
        svg: {
            position: 'absolute',
            top: 0,
            right: 0,
        },
        iconContainer: {
            position: 'absolute',
            right: 6,
            top: 8,
        },
    })
);
