import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles((theme) => ({
    container: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        padding: theme.layout.card.padding,
        borderRadius: theme.layout.card.borderRadius,
        backgroundColor: theme.palette.feedback.errorBg,
        borderWidth: 1,
        borderColor: theme.palette.feedback.errorBorder,
        gap: 8,
        width: '100%',
    },
    textContainer: {
        flex: 1,
    },
    messageText: {
        flexShrink: 1,
        color: theme.palette.feedback.errorText,
    },
}));
