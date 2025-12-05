import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useStepperStyles = createStyles((theme) =>
    StyleSheet.create({
        wrap: {
            gap: 6,
        },
        label: {
            color: theme.palette.text.muted,
            fontSize: 13,
            fontWeight: '500',
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        btn: {
            backgroundColor: theme.palette.accent.surfaces,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
        },
        btnText: {
            color: theme.palette.text.primary,
            fontWeight: '700',
            fontSize: 18,
        },
        input: {
            flex: 1,
            textAlign: 'center',
            backgroundColor: theme.palette.background.card,
            color: theme.palette.text.primary,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
        },
        pressed: {
            opacity: 0.9,
        },
    })
);
