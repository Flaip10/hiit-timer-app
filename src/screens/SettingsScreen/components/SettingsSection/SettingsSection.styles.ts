import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useSettingsSectionStyles = createStyles((theme) =>
    StyleSheet.create({
        section: {
            gap: 10,
            paddingVertical: 12,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        sectionTitle: {
            color: theme.palette.text.header,
        },
    })
);
