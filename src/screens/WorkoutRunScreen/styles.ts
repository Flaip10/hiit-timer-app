import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    runContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 10,
    },

    // main state
    phase: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F2F2F2',
    },
    timer: {
        color: '#F2F2F2',
        fontSize: 96,
        fontVariant: ['tabular-nums'],
    },
    meta: {
        color: '#A1A1AA',
        marginTop: 6,
        fontSize: 14,
    },
    next: {
        color: '#9CA3AF',
        marginTop: 4,
        fontSize: 14,
    },

    // empty state
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    emptyTitle: {
        color: '#F2F2F2',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    emptyText: {
        color: '#A1A1AA',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
    },
});

export default st;
