import React from 'react';
import { TextInput, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@src/theme/ThemeProvider';
import { useSearchFieldStyles } from './SearchField.styles';
import GuardedPressable from '../GuardedPressable/GuardedPressable';

type SearchFieldProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    fullWidth?: boolean;
    containerStyle?: ViewStyle;
};

export const SearchField: React.FC<SearchFieldProps> = ({
    value,
    onChangeText,
    placeholder = 'Search',
    fullWidth = false,
    containerStyle,
}) => {
    const { theme } = useTheme();
    const st = useSearchFieldStyles();

    return (
        <View
            style={[
                st.container,
                fullWidth && st.containerFullWidth,
                containerStyle,
            ]}
        >
            <Ionicons
                name="search-outline"
                size={18}
                color={theme.palette.text.muted}
                style={st.iconLeft}
            />

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.palette.text.muted}
                style={st.input}
            />

            {value.length > 0 && (
                <GuardedPressable
                    onPress={() => onChangeText('')}
                    style={st.clearHitbox}
                >
                    <Ionicons
                        name="close-circle"
                        size={22}
                        color={theme.palette.text.muted}
                    />
                </GuardedPressable>
            )}
        </View>
    );
};
