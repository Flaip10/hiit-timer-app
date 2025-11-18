import { StyleSheet } from 'react-native';

const ARC_SIZE = 220;

const st = StyleSheet.create({
    runContainer: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },

    phasePill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 8,
    },
    phasePillText: {
        color: '#0B0B0C',
        fontWeight: '700',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    arcWrapper: {
        width: ARC_SIZE,
        height: ARC_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    timer: {
        position: 'absolute',
        color: '#F2F2F2',
        fontSize: 96,
        fontVariant: ['tabular-nums'],
    },

    metaContainer: {
        marginTop: 8,
        alignItems: 'center',
        minHeight: 40, // keeps timer from shifting when "Next" appears/disappears
        justifyContent: 'center',
        gap: 2,
    },
    meta: {
        color: '#A1A1AA',
        fontSize: 14,
    },
    next: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    nextPlaceholder: {
        height: 18, // roughly one line of text, keeps layout stable
    },

    progressContainer: {
        marginTop: 12,
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

    // === EMPTY RUN STATE ===
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
    // main state
    phase: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F2F2F2',
    },
});

export default st;
