import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    // main state
    phase: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F2F2F2',
    },

    runContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 10,
    },

    phasePill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 12,
    },
    phasePillText: {
        color: '#0B0B0C',
        fontWeight: '700',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
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

    progressContainer: {
        marginTop: 16,
        width: '100%',
        maxWidth: 360,
        gap: 6,
    },
    progressText: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    progressBarBg: {
        flexDirection: 'row',
        height: 6,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: '#111827',
    },
    progressBarFill: {
        backgroundColor: '#2563EB',
    },
    progressBarRemaining: {
        backgroundColor: 'transparent',
    },
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
