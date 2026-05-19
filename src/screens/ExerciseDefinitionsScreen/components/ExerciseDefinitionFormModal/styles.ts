import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useExerciseDefinitionFormModalStyles = createStyles(
    (theme: AppTheme) =>
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
                gap: 16,
            },
            textContainer: {
                padding: 6,
                gap: 6,
            },
            formContainer: {
                gap: 14,
            },
            availabilityContainer: {
                gap: 6,
            },
            buttonsContainer: {
                gap: 14,
            },
            cancelButton: {
                paddingVertical: 10,
                alignItems: 'center',
                marginBottom: -4,
            },
        }),
);
