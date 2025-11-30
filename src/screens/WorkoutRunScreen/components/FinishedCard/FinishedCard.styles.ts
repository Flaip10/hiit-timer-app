import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    finishedCard: {
        marginHorizontal: 16,
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 18,
        backgroundColor: '#020617', // dark navy
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    finishedTitle: {
        color: '#E5E7EB',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    finishedBody: {
        color: '#9CA3AF',
        fontSize: 14,
    },
});

export default st;
