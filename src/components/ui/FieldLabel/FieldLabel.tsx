import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { FieldLabelProps } from './FieldLabel.interfaces';
import { useFieldLabelStyles } from './FieldLabel.styles';
import { useTheme } from '@src/theme/ThemeProvider';
import { AppText } from '../Typography/AppText';

export const FieldLabel: React.FC<FieldLabelProps> = ({
    label,
    iconName = 'create-outline',
}) => {
    const { theme } = useTheme();
    const st = useFieldLabelStyles();

    return (
        <View style={st.container}>
            <View style={st.iconWrapper}>
                <Ionicons
                    name={iconName as never}
                    size={12}
                    color={theme.palette.fieldLabel.icon}
                />
            </View>

            <AppText variant="label" tone="secondary">
                {label}
            </AppText>
        </View>
    );
};
