import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useOptionPillsStyles = createStyles((theme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 4,
        },
        pill: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            backgroundColor: 'transparent',
        },
        pillContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        leftSlot: {
            // Container for left slot content (e.g., flag emoji)
        },
    })
);

