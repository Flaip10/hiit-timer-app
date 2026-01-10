import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

type ModalStyleProps = {
    solidBackground?: boolean;
};

export const useModalStyles = createStyles(
    (theme: AppTheme, { solidBackground = false }: ModalStyleProps) =>
        StyleSheet.create({
            backdrop: {
                ...StyleSheet.absoluteFillObject,
                backgroundColor: solidBackground
                    ? theme.palette.background.primary
                    : theme.palette.overlay.scrim,
            },
            backdropPress: {
                flex: 1,
            },
            centerWrap: {
                flex: 1,
                justifyContent: 'center',
            },
        })
);
