import { createStyles } from '@src/theme/createStyles';
import { AppTheme } from '@src/theme/theme';
import { StyleSheet } from 'react-native';

type StyleProps = {
    gap: number;
    noPadding: boolean;
};

export const useMainContainerStyles = createStyles(
    (theme: AppTheme, props: StyleProps) =>
        StyleSheet.create({
            content: {
                flexGrow: 1,
                padding: props.noPadding ? 0 : theme.layout.screen.padding,
                paddingHorizontal: props.noPadding
                    ? 0
                    : theme.layout.screen.padding,
                gap: props.gap,
                backgroundColor: theme.palette.background.primary,
            },
            kav: {
                flex: 1,
            },
        })
);
