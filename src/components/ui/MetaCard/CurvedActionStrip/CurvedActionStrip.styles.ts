import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useCurvedActionStripStyles = createStyles((_: AppTheme) =>
    StyleSheet.create({
        touchArea: {
            position: 'absolute',
            top: 0,
            right: -14,
            height: 60,
            width: 70,
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
        },
        svg: {
            position: 'absolute',
            top: 0,
            right: 0,
        },
        iconContainer: {
            position: 'absolute',
            top: 8,
            right: 6,
        },
    })
);
