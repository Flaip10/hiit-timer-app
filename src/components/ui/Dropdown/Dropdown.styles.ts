import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useDropdownStyles = createStyles((theme) =>
    StyleSheet.create({
        root: {
            flex: 1,
        },
        portalLayer: {
            ...StyleSheet.absoluteFill,
            zIndex: 100,
            elevation: 100,
        },
        dropdownContent: {
            ...StyleSheet.absoluteFill,
        },
        dismissLayer: {
            ...StyleSheet.absoluteFill,
        },
        surface: {
            position: 'absolute',
            backgroundColor: theme.palette.background.primary,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            borderRadius: 16,
            overflow: 'hidden',
        },
    }),
);
