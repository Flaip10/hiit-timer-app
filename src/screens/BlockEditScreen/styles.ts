import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    label: { color: '#A1A1AA', marginBottom: 6 },
    subLabel: { color: '#A1A1AA', marginTop: 10, marginBottom: 6 },
    input: {
        backgroundColor: '#131316',
        color: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
    },

    sectionTitle: {
        color: '#E5E7EB',
        fontWeight: '700',
        fontSize: 16,
        marginTop: 12,
    },

    advRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    advText: { color: '#A1A1AA' },

    segment: {
        flexDirection: 'row',
        backgroundColor: '#0F0F12',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
        overflow: 'hidden',
    },
    segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    segmentBtnActive: { backgroundColor: '#1F2937' },
    segmentText: { color: '#A1A1AA', fontWeight: '700' },
    segmentTextActive: { color: '#F2F2F2', fontWeight: '700' },

    addMinor: {
        alignSelf: 'flex-start',
        backgroundColor: '#1C1C1F',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#1F1F23',
    },
    addMinorText: { color: '#E5E7EB', fontWeight: '700' },

    footer: { flexDirection: 'row', gap: 10, marginTop: 16, paddingBottom: 8 },
    primary: {
        flex: 1,
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    secondary: {
        flex: 1,
        backgroundColor: '#1C1C1F',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryText: { color: '#E5E7EB', fontWeight: '700' },
    pressed: { opacity: 0.9 },

    errorBox: {
        backgroundColor: '#2A0E0E',
        borderColor: '#7F1D1D',
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        marginTop: 8,
        gap: 4,
    },
    errorText: { color: '#FCA5A5' },
    err: { color: '#FCA5A5', marginBottom: 12 },
});

export default st;
