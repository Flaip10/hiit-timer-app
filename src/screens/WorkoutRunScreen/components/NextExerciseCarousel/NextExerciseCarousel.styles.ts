import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    nextCardWrapper: {
        marginTop: 4,
    },

    nextCard: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#020617',
        borderWidth: 1,
        borderColor: '#1F2937',
        overflow: 'hidden',
    },

    nextTitle: {
        color: '#9CA3AF',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },

    nextText: {
        color: '#E5E7EB',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default st;
