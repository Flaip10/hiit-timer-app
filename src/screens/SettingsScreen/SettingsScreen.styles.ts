import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useSettingsStyles = createStyles((theme) =>
    StyleSheet.create({
        separator: {
            height: 1,
            backgroundColor: theme.palette.border.subtle,
        },
        aboutContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            marginTop: 8,
        },
        aboutInfo: {
            flex: 1,
            gap: 4,
        },
        appName: {
            color: theme.palette.text.primary,
        },
        copyright: {
            marginTop: 4,
        },
        flagEmoji: {
            fontSize: 16,
        },
    })
);
