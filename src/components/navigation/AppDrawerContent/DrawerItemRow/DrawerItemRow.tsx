import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@src/components/ui/Typography/AppText';
import { useDrawerItemRowStyles } from './DrawerItemRow.styles';
import { getDrawerIconName } from '../helpers';

export type DrawerItemRowProps = {
    label: string;
    focused: boolean;
    onPress: () => void;

    iconName?: React.ComponentProps<typeof Ionicons>['name'];

    activeTintColor: string;
    inactiveTintColor: string;
    activeBgColor: string;
};

export const DrawerItemRow = ({
    label,
    focused,
    onPress,
    iconName,
    activeTintColor,
    inactiveTintColor,
}: DrawerItemRowProps) => {
    const st = useDrawerItemRowStyles();

    const tint = focused ? activeTintColor : inactiveTintColor;

    const icon = getDrawerIconName(iconName, focused);

    return (
        <Pressable
            onPress={onPress}
            style={[
                st.pressableBase,
                focused ? st.pressableActive : st.pressableInactive,
            ]}
        >
            <View style={st.contentRow}>
                {icon ? <Ionicons name={icon} size={18} color={tint} /> : null}

                <AppText
                    variant="subtitle"
                    numberOfLines={1}
                    style={focused ? st.labelActive : st.labelInactive}
                >
                    {label}
                </AppText>
            </View>
        </Pressable>
    );
};

export default DrawerItemRow;
