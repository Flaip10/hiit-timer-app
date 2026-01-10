import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useNewWorkoutModalStyles = createStyles((theme) =>
    StyleSheet.create({
        modalContainer: {
            padding: 20,
        },
        modalContent: {
            backgroundColor: theme.palette.background.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            padding: 16,
            shadowColor: theme.palette.background.primary,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
        },
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
