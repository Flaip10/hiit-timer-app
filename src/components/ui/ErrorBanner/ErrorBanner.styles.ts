import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles((theme) => ({
    container: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.layout.card.padding,
        paddingRight: theme.layout.card.padding + 30,
        borderRadius: theme.layout.card.borderRadius,
        backgroundColor: theme.palette.background.error,
        borderWidth: 1,
        borderColor: theme.palette.border.error,
        gap: 8,
        width: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: theme.layout.card.padding,
        right: theme.layout.card.padding,
    },
    textContainer: {
        flex: 1,
    },
    messageText: {
        flexShrink: 1,
        color: theme.palette.text.error,
    },
}));
