import { createStyles } from '@src/theme/createStyles';

const useExerciseInfoCardStyles = createStyles((theme) => ({
    currentCard: {
        width: '100%',
    },

    currentHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },

    currentTitle: {
        color: theme.palette.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    currentBodyRow: {
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 16,
    },

    currentName: {
        color: theme.palette.text.primary,
    },

    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

export default useExerciseInfoCardStyles;
