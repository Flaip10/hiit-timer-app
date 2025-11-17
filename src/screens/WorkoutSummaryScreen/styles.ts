// src/screens/WorkoutSummary/styles.ts
import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    errorText: {
        color: '#FCA5A5',
        fontSize: 16,
        marginBottom: 12,
    },
    errorButton: {
        alignSelf: 'center',
    },

    card: {
        backgroundColor: '#111113',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 14,
        marginBottom: 16,
    },
    cardTitle: {
        color: '#E5E7EB',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    metric: {
        flex: 1,
    },
    metricLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 4,
    },
    metricValue: {
        color: '#F9FAFB',
        fontSize: 16,
        fontWeight: '700',
    },

    sectionTitle: {
        color: '#E5E7EB',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    blockItem: {
        backgroundColor: '#111113',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1F1F23',
        padding: 10,
        marginBottom: 8,
    },
    blockTitle: {
        color: '#F9FAFB',
        fontWeight: '700',
        marginBottom: 4,
    },
    blockMeta: {
        color: '#9CA3AF',
        fontSize: 13,
    },

    hint: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 12,
    },
});

export default st;
