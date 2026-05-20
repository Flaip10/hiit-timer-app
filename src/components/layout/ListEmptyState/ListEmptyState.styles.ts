import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useListEmptyStateStyles = createStyles(() =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40,
            gap: 8,
        },
        description: {
            textAlign: 'center',
            maxWidth: 260,
        },
        button: {
            marginTop: 8,
        },
    }),
);
