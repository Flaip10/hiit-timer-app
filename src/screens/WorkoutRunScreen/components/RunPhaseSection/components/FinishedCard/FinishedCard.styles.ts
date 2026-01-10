import { createStyles } from '@src/theme/createStyles';

const useFinishedCardStyles = createStyles((_theme) => ({
    finishedCard: {},
    overviewRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
    },
    metricCard: {
        flex: 1,
        minWidth: '25%',
        gap: 4,
    },
    metricLabel: {
        marginBottom: 2,
    },
}));

export default useFinishedCardStyles;
