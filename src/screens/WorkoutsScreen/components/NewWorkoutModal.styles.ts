import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    mainContainer: {
        gap: 20,
    },
    textContainer: {
        gap: 10,
    },

    modalTitle: {
        color: '#F2F2F2',
        fontSize: 18,
        fontWeight: '700',
    },

    modalSubtitle: {
        color: '#A1A1AA',
        fontSize: 14,
    },

    btnsContainer: { gap: 12 },

    modalBtn: {
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },

    modalBtnText: {
        color: '#fff',
        fontWeight: '700',
    },

    primary: { backgroundColor: '#2563EB' },
    secondary: { backgroundColor: '#1C1C1F' },

    modalCancelBtn: {
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: -4,
    },

    modalCancelText: {
        color: '#9CA3AF',
        fontSize: 14,
    },

    modalInput: {
        minHeight: 120,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#27272A',
        borderRadius: 8,
        padding: 10,
        color: '#E5E7EB',
        fontSize: 13,
        fontFamily: 'Menlo',
        textAlignVertical: 'top',
    },

    modalError: {
        color: '#F87171',
        fontSize: 12,
    },
});

export default st;
