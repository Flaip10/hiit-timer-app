import { createStyles } from '@src/theme/createStyles';

const useWorkoutMetaStripStyles = createStyles((theme) => ({
    metaStripContainer: {
        width: '100%',
        gap: 12,
    },
    metaStripTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metaStripTopLeft: {
        flex: 1,
    },
    metaStripTopRight: {
        flex: 1,
        alignItems: 'flex-end',
    },

    metaStripPillsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    metaStripPillOuter: {
        flex: 1,
        height: 4,
        borderRadius: 999,
        backgroundColor: theme.palette.accent.soft,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    metaStripPillFill: {
        borderRadius: 999,
    },
    metaStripPillRemainder: {
        borderRadius: 999,
        backgroundColor: 'transparent',
    },

    metaStripBlockText: {
        color: theme.palette.text.muted,
        fontWeight: '700',
    },

    metaStripSetText: {
        color: theme.palette.text.muted,
        fontWeight: '700',
        // base font size from caption variant
    },
}));

export default useWorkoutMetaStripStyles;
