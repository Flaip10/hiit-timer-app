import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    base: {
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    default: {},
    primary: {
        backgroundColor: '#2563EB',
        borderWidth: 1,
        borderColor: '#2563EB',
    },
    secondary: {
        backgroundColor: '#1C1C1F',
        borderWidth: 1,
        borderColor: '#2A2A30',
    },
    danger: {
        backgroundColor: '#B91C1C',
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    text: {
        color: '#E5E7EB',
        fontWeight: '700',
        fontSize: 14,
    },
    textPrimary: {
        color: '#FFFFFF',
    },
    textSecondary: {
        color: '#E5E7EB',
    },
    textGhost: {
        color: '#E5E7EB',
    },

    disabled: {
        opacity: 0.5,
    },
    pressed: {
        opacity: 0.85,
    },
});

export default st;
