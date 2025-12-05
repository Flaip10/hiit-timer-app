import { createStyles } from '@src/theme/createStyles';
import { StyleSheet } from 'react-native';

export const useMainContainerStyles = createStyles((theme) =>
    StyleSheet.create({
        content: {
            flexGrow: 1,
            padding: 16,
            paddingHorizontal: 16,
            gap: 8,
            backgroundColor: theme.palette.background.primary,
        },
        kav: {
            flex: 1,
        },
    })
);
