import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    currentCard: {
        width: '100%',
    },

    currentHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },

    currentTitle: {
        color: '#9CA3AF',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    currentPhasePill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },

    currentPhaseText: {
        color: '#0B0B0C',
        fontSize: 12,
        fontWeight: '700',
    },

    currentName: {
        color: '#F9FAFB',
        fontSize: 20,
        fontWeight: '700',
    },
    currentBodyRow: {
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        justifyContent: 'flex-start',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkMark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default st;
