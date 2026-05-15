import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles((theme) => ({
    button: {
        marginTop: theme.layout.mainContainer.gap,
        minWidth: 160,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.layout.screen.paddingHorizontal,
        backgroundColor: theme.palette.background.primary,
    },
    description: {
        marginTop: theme.layout.listItem.gap,
        maxWidth: 320,
    },
}));
