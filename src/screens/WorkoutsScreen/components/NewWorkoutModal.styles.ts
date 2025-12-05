import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useNewWorkoutModalStyles = createStyles((theme) =>
    StyleSheet.create({
        mainContainer: {
            gap: 14,
        },
        textContainer: {
            padding: 6,
            gap: 6,
        },

        title: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.palette.text.primary,
        },

        subtitle: {
            fontSize: 14,
            color: theme.palette.text.secondary,
        },

        buttonsContainer: {
            display: 'flex',
            gap: 14,
        },

        cancelButton: {
            paddingVertical: 10,
            alignItems: 'center',
            marginBottom: -4,
        },

        cancelText: {
            fontSize: 14,
            color: theme.palette.text.muted,
        },
    })
);
