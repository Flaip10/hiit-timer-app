import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import type { ScreenSectionTopSpacing } from './ScreenSection.interfaces';

type ScreenSectionStyleProps = {
    topSpacing?: ScreenSectionTopSpacing;
    gap: number;
};

const getTopMargin = (spacing?: ScreenSectionTopSpacing): number => {
    switch (spacing) {
        case 'small':
            return 8;
        case 'medium':
            return 16;
        case 'large':
            return 24;
        case 'none':
        default:
            return 0;
    }
};

export const useScreenSectionStyles = createStyles(
    (theme: AppTheme, props: ScreenSectionStyleProps) =>
        StyleSheet.create({
            container: {
                marginTop: getTopMargin(props.topSpacing),
                width: '100%',
            },
            headerRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
            },
            title: {
                color: theme.palette.text.header,
            },
            content: {
                gap: props.gap,
                width: '100%',
            },
        })
);
