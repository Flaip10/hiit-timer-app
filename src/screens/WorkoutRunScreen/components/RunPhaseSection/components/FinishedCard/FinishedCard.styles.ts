import { createStyles } from '@src/theme/createStyles';

const useFinishedCardStyles = createStyles((_theme) => ({
    finishedCard: {},
    overviewRow: {
        gap: 16,
    },
    overviewMetricsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: 16,
    },
    metricCard: {
        flex: 1,
        minWidth: '25%',
        justifyContent: 'space-between',
        gap: 6,
    },
    metricLabelSlot: {
        flexGrow: 1,
    },
    metricLabel: {
        flexShrink: 1,
    },
}));

export default useFinishedCardStyles;
