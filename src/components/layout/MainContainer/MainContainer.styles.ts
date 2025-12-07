import { createStyles } from '@src/theme/createStyles';
import { AppTheme } from '@src/theme/theme';
import { StyleSheet } from 'react-native';

type StyleProps = {
    gap: number;
};

export const useMainContainerStyles = createStyles(
    (theme: AppTheme, props: StyleProps) =>
        StyleSheet.create({
            content: {
                flexGrow: 1,
                padding: 16,
                paddingHorizontal: 16,
                gap: props.gap,
                backgroundColor: theme.palette.background.primary,
            },
            kav: {
                flex: 1,
            },
        })
);
