import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    cardContainer: {
        width: 360,
        maxWidth: '100%',
        aspectRatio: 0.5, // 2:1, share-friendly
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#020617',
        borderWidth: 1,
        borderColor: '#111827',
        justifyContent: 'space-between',
    },

    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    cardAppName: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    cardDurationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#111827',
    },

    cardDurationIcon: {
        marginRight: 4,
    },

    cardDurationText: {
        color: '#E5E7EB',
        fontSize: 13,
        fontWeight: '500',
    },

    cardTitleBlock: {
        marginTop: 8,
    },

    cardTitle: {
        color: '#F9FAFB',
        fontSize: 20,
        fontWeight: '700',
    },

    cardSubtitle: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 2,
    },

    cardArcWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cardArcCircleOuter: {
        width: '62%',
        aspectRatio: 1,
        borderRadius: 999,
        borderWidth: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#22C55E',
    },

    cardArcInnerText: {
        color: '#F9FAFB',
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    cardFooterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },

    cardFooterLeft: {
        color: '#9CA3AF',
        fontSize: 12,
    },

    cardFooterRight: {
        color: '#6366F1',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default st;
