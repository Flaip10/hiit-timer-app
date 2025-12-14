import { createStyles } from '@src/theme/createStyles';
import { StyleSheet } from 'react-native';

export const BAR_H = 72;
export const PILL_H = 45;

// Defines the *reserved* lateral space (layout), not the button position.
export const SLOT_W = 36;

export const useStyles = createStyles((theme) =>
    StyleSheet.create({
        root: { backgroundColor: theme.palette.accent.primary },

        bar: {
            backgroundColor: theme.palette.background.primary,
            flexDirection: 'row',
            position: 'relative',
        },

        // Spacers define lateral space consistently. They do not render buttons.
        sideSpacer: {
            width: SLOT_W,
        },

        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 10,
        },

        pillHost: {
            width: '100%',
            height: PILL_H,
            justifyContent: 'center',
            alignItems: 'center',
        },

        pillSvg: {
            position: 'absolute',
            left: 0,
            top: 0,
        },

        title: { color: theme.palette.text.inverted },
        titleInteractive: { opacity: 0.95 },

        // Actions are absolute: their position doesn't depend on SLOT_W.
        action: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
        },

        leftAction: {
            left: 10,
            alignItems: 'flex-start',
        },

        rightAction: {
            right: 10,
            alignItems: 'flex-end',
        },
    })
);
