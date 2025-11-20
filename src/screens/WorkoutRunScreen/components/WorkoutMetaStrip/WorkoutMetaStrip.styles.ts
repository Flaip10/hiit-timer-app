import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
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
    metaStripTopRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
});

export default st;
