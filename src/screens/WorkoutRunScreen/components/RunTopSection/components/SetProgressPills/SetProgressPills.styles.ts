import { createStyles } from '@src/theme/createStyles';

const useWorkoutMetaStripStyles = createStyles((theme) => ({
    metaStripPillsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
    },
    metaStripPillOuter: {
        flex: 1,
        height: 5,
        borderRadius: 999,
        backgroundColor: theme.palette.background.card,
        overflow: 'hidden',
        flexDirection: 'row',
        position: 'relative', // important (for absolute fill overlay)
    },
    metaStripPillFill: {
        borderRadius: 999,
    },
    metaStripPillFillAbsolute: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 999,
    },
    metaStripPillRemainder: {
        flex: 1,
        borderRadius: 999,
        backgroundColor: 'transparent',
    },
}));

export default useWorkoutMetaStripStyles;
