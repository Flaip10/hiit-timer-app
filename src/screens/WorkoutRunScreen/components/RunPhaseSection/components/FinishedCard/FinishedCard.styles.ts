import { createStyles } from '@src/theme/createStyles';

const useFinishedCardStyles = createStyles((theme) => ({
    finishedCard: {
        marginHorizontal: 16,
        paddingVertical: theme.layout.card.padding,
        paddingHorizontal: theme.layout.card.padding,
        borderRadius: theme.layout.card.borderRadius,
        backgroundColor: theme.palette.background.card,
        // backgroundColor: '#020617',
        borderWidth: 1,
        borderColor: theme.palette.border.subtle,
        // borderColor: '#1F2937',
    },
    finishedTitle: {
        color: theme.palette.text.primary,
        marginBottom: 10,
    },
    finishedBody: {
        color: theme.palette.text.muted,
    },
}));

export default useFinishedCardStyles;
