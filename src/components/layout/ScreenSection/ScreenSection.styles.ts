import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

interface ScreenSectionStyleProps {
    topSpacing?: number;
}

export const useScreenSectionStyles = createStyles(
    (theme: AppTheme, props: ScreenSectionStyleProps) =>
        StyleSheet.create({
            container: {
                marginTop: props.topSpacing ?? 16,
                width: '100%',
                gap: 12,
            },
            headerRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            },
            title: {
                color: theme.palette.text.header,
                fontSize: 16,
                fontWeight: '700',
            },
        })
);
