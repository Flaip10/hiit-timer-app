import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useWorkoutSummaryStyles = createStyles((theme: AppTheme) =>
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

        overviewRow: {
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 14,
        },
        metricCard: {
            flex: 1,
            backgroundColor: theme.palette.background.card,
            justifyContent: 'center',
        },
        metricCardWide: {
            flex: 1.2,
            backgroundColor: theme.palette.background.card,
            justifyContent: 'center',
        },
        metricLabel: {
            marginBottom: 2,
        },
        metricValue: {
            fontWeight: '700',
        },

        blockBody: {
            paddingVertical: 4,
        },

        hint: {
            marginTop: 4,
        },

        exportContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            gap: 10,
        },
        exportText: {
            color: theme.palette.text.muted,
            borderBottomColor: theme.palette.text.muted,
            borderBottomWidth: 1,
        },
    })
);
