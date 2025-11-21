import { StyleSheet } from 'react-native';

export const ARC_SIZE = 280;

const st = StyleSheet.create({
    arcContainer: {
        marginTop: 25,
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

    // Empty Run State
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

    //Exercises Info
    exerciseInfoContainer: {
        width: '100%',
        marginTop: -50,
        paddingHorizontal: 10,
        paddingVertical: 14,
        gap: 12,
    },

    // Workout Timer
    workoutTimerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    workoutTimerIcon: {
        marginRight: 4,
    },

    // wrapper with fixed width → layout doesn’t shift
    workoutTimerTextWrapper: {
        width: 57, // tweak as needed, just ensure it's enough for "MM:SS left"
    },

    workoutTimerText: {
        color: '#F9FAFB',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'left', // anchor to left inside the wrapper
    },

    // Page Header
    // Region that holds header + meta strip (fixed height to avoid arc shifting)
    topRegion: {
        width: '100%',
        paddingTop: 16,
        // tweak this so it roughly matches the height of header + strip while running
        minHeight: 120,
        justifyContent: 'flex-start',
    },
    pageHeader: {
        gap: 12,
        paddingHorizontal: 16,
    },
    pageHeaderInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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

    footerFinishedWrapper: {
        width: '100%',
        paddingHorizontal: 16,
    },
    footerFinishedButton: {
        width: '100%',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4F46E5', // same primary as other CTAs
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    footerFinishedText: {
        color: '#F9FAFB',
        fontSize: 16,
        fontWeight: '600',
    },

    //New additions

    runHeader: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
    },

    // ===== Finished header =====
    finishedTitle: {
        color: '#F9FAFB',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 6,
    },
    finishedSubtitle: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
    finishedChipsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    finishedChip: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: '#020617',
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    finishedChipLabel: {
        color: '#6B7280',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 2,
    },
    finishedChipValue: {
        color: '#F9FAFB',
        fontSize: 14,
        fontWeight: '600',
    },
    finishedDurationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    finishedDurationText: {
        color: '#F9FAFB',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default st;
