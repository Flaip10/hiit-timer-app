import { createStyles } from '@src/theme/createStyles';

const useWorkoutMetaStripStyles = createStyles((theme) => ({
    // Just the pills row + pill segments – no labels/layout here anymore
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
        // backgroundColor: theme.palette.accent.soft,
        backgroundColor: theme.palette.background.card,
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
}));

export default useWorkoutMetaStripStyles;
