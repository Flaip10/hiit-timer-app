import { StyleSheet } from 'react-native';

export const st = StyleSheet.create({
    container: {
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
    },
    bottomFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        // Simple dark fade-ish overlay – you can tweak this or
        // swap to a LinearGradient later if you want a true gradient.
        backgroundColor: '#0B0B0C',
        opacity: 0.75,
    },
    hiddenContent: {
        opacity: 0,
    },
});
