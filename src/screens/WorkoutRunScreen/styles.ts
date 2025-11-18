import { StyleSheet } from 'react-native';

export const ARC_SIZE = 240;

const st = StyleSheet.create({
    arcContainer: {
        marginTop: 60,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
    },

    phasePill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 999,
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
    // Container that holds both "current" and "next"
    metaContainer: {
        width: '100%',
        marginTop: 16,
    },

    // ----- CURRENT EXERCISE CARD -----
    currentCard: {
        width: '100%',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
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

    // ----- NEXT (CAROUSEL) -----
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

    nextEmpty: {
        color: '#4B5563',
        fontSize: 13,
    },
    progressContainer: {
        width: '100%',
        marginTop: 16,
        gap: 6,
    },

    progressHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    progressMeta: {
        color: '#9CA3AF',
        fontSize: 12,
    },

    progressText: {
        color: '#E5E7EB',
        fontSize: 12,
        fontWeight: '600',
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
