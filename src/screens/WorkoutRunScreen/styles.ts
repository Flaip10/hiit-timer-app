import { StyleSheet } from 'react-native';

export const ARC_SIZE = 280;

const st = StyleSheet.create({
    arcContainer: {
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
    },

    phasePill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 0,
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
        marginTop: -50,
        paddingHorizontal: 10,
        paddingVertical: 14,
        gap: 12,
    },

    // ----- CURRENT EXERCISE CARD -----
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
    finishedBox: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#111827',
        alignSelf: 'stretch',
        marginTop: 12,
    },
    finishedText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    finishedTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    finishedEmoji: {
        fontSize: 18,
    },
    finishedCard: {
        marginHorizontal: 16,
        marginTop: 16,
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
    footerRunLayout: {
        width: '100%',
        gap: 12,
    },
    footerTopRow: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'space-between',
    },
    bigPrimaryText: {
        fontSize: 18,
    },
    primaryAlt: { opacity: 0.6 },
    smallSecondary: {
        width: 100,
    },
    metaStripContainer: {
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 8,
        gap: 12,
    },
    metaStripTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metaStripTopLeft: {
        flex: 1,
    },
    metaStripTopCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    metaStripTimeIcon: {
        marginRight: 4,
    },

    // wrapper with fixed width → layout doesn’t shift
    metaStripTimeTextWrapper: {
        width: 57, // tweak as needed, just ensure it's enough for "MM:SS left"
    },

    metaStripTimeText: {
        color: '#F9FAFB',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'left', // anchor to left inside the wrapper
    },
    metaStripTopRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    metaStripBlockText: {
        color: '#E5E7EB',
        fontSize: 14,
        fontWeight: '600',
    },

    metaStripSetText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '700',
    },

    metaStripPillsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    metaStripPillOuter: {
        flex: 1,
        height: 8,
        borderRadius: 999,
        backgroundColor: '#111827',
        overflow: 'hidden',
        flexDirection: 'row',
    },
    metaStripPillFill: {
        borderRadius: 999,
    },
    metaStripPillRemainder: {
        borderRadius: 999,
        backgroundColor: 'transparent',
    },
    timeLeftUnderArc: {
        marginTop: 8,
        color: '#9CA3AF',
        fontSize: 13,
    },
    runHeader: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
    },
    runWorkoutTitle: {
        color: '#F9FAFB',
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    footerIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 32,
    },

    footerIconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },

    footerIconLabel: {
        color: '#E5E7EB',
        fontSize: 12,
        fontWeight: '500',
    },

    footerRoundPrimary: {
        width: 76,
        height: 76,
        borderRadius: 38,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },

    footerRoundSecondary: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default st;
