import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useSettingsSubSectionStyles = createStyles(() =>
    StyleSheet.create({
        subSection: {
            gap: 4,
        },
        description: {
            marginBottom: 4,
        },
    })
);

