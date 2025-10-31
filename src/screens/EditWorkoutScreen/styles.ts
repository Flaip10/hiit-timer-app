import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C' },
    content: { flexGrow: 1, padding: 16, gap: 12, paddingBottom: 40 },
    label: { color: '#A1A1AA', marginBottom: 6 },
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

    blockCard: {
        backgroundColor: '#111113',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 12,
        marginTop: 8,
        gap: 6,
    },
    blockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    blockTitle: { color: '#F2F2F2', fontWeight: '700', fontSize: 15 },
    blockInfo: { color: '#A1A1AA', fontSize: 13 },

    blockActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
    smallButton: {
        backgroundColor: '#1C1C1F',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    smallText: { color: '#E5E7EB', fontWeight: '700' },
    removeButton: {
        backgroundColor: '#3B0D0D',
        borderColor: '#7F1D1D',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    removeText: { color: '#FCA5A5', fontWeight: '700' },

    addBlock: {
        backgroundColor: '#1C1C1F',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
    },

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
});

export default st;
