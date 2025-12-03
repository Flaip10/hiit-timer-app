import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    primaryCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },

    secondaryCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
    },
});

export default st;
