import { createStyles } from '@src/theme/createStyles';

const useNextExerciseCarouselStyles = createStyles((theme) => ({
    nextCardWrapper: {
        marginTop: 4,
    },

    nextCard: {
        borderRadius: theme.layout.card.borderRadius,
        paddingHorizontal: theme.layout.card.padding,
        paddingVertical: theme.layout.card.padding,
        backgroundColor: theme.palette.background.card,
        // backgroundColor: '#020617',
        gap: 4,
        borderWidth: 1,
        borderColor: theme.palette.border.subtle,
        // borderColor: '#1F2937',
        overflow: 'hidden',
    },

    nextTitle: {
        color: theme.palette.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },

    nextText: {
        color: theme.palette.text.primary,
        fontSize: 15,
        fontWeight: '600',
    },
}));

export default useNextExerciseCarouselStyles;
