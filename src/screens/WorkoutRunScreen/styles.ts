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
    pageHeader: {
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
