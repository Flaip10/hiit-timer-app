import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useExerciseDefinitionDetailsScreenStyles = createStyles(
    (_theme: AppTheme) =>
        StyleSheet.create({
            center: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
            },
            errorText: {
                marginBottom: 12,
            },
            errorButton: {
                alignSelf: 'center',
            },
            overviewContainer: {
                flexDirection: 'row',
                alignItems: 'stretch',
                justifyContent: 'space-between',
                gap: 14,
            },
            metricCard: {
                flex: 1,
                justifyContent: 'center',
            },
            metricCardWide: {
                flex: 1.35,
                justifyContent: 'center',
            },
            metricLabel: {
                marginBottom: 2,
            },
            metricValue: {
                fontWeight: '700',
            },
        }),
);
