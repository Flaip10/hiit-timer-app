import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useExerciseDefinitionsScreenStyles = createStyles(
    (theme: AppTheme) =>
        StyleSheet.create({
            headerContainer: {
                gap: theme.layout.listItem.gap,
            },
            headerRow: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
            },
            list: {
                flex: 1,
                width: '100%',
                padding: theme.layout.screen.padding,
            },
            listContent: {
                gap: theme.layout.listItem.gap,
                paddingBottom: theme.insets.bottom,
            },
            newButton: {
                alignSelf: 'flex-start',
            },
        }),
);
