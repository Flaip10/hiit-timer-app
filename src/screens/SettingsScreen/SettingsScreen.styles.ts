import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useSettingsStyles = createStyles((theme) =>
    StyleSheet.create({
        section: {
            gap: 16,
        },
        switchRow: {
            flexDirection: 'row',
            gap: 8,
            marginTop: 8,
        },
        pill: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            backgroundColor: 'transparent',
        },
    })
);
