import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ErrorBannerProps = {
    message: string;
    onClose?: () => void;
    style?: StyleProp<ViewStyle>;
};

export const ErrorBanner = ({ message, onClose, style }: ErrorBannerProps) => {
    return (
        <View style={[s.container, style]}>
            <Ionicons name="alert-circle" size={18} color="#FCA5A5" />
            <Text style={s.text}>{message}</Text>
            {onClose && (
                <Pressable onPress={onClose} hitSlop={8}>
                    <Ionicons name="close" size={16} color="#E5E7EB" />
                </Pressable>
            )}
        </View>
    );
};

const s = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#451A1A',
        borderWidth: 1,
        borderColor: '#B91C1C',
        marginBottom: 8,
        gap: 8,
        width: '100%',
    },
    text: {
        flex: 1,
        color: '#FECACA',
        fontSize: 13,
    },
});
