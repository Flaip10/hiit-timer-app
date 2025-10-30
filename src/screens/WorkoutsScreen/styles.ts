import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B0C', padding: 16 },
    headerRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    search: {
        flex: 1,
        backgroundColor: '#131316',
        color: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
    },
    newBtn: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    newBtnText: { color: '#fff', fontWeight: '700' },

    card: {
        backgroundColor: '#111113',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: { color: '#F2F2F2', fontWeight: '700', fontSize: 16 },
    sub: { color: '#A1A1AA', marginTop: 2 },

    row: { flexDirection: 'row', gap: 8 },
    smallBtn: {
        backgroundColor: '#1C1C1F',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    smallBtnText: { color: '#E5E7EB', fontWeight: '700' },
    smallDanger: {
        backgroundColor: '#2A0E0E',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#7F1D1D',
    },
    smallDangerText: { color: '#FCA5A5', fontWeight: '700' },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 12,
    },
    emptyText: {
        color: '#A1A1AA',
        fontSize: 16,
        textAlign: 'center',
    },
    pressed: { opacity: 0.9 },
});

export default st;
