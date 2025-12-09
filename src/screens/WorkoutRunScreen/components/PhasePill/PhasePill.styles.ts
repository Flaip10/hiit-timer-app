import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const usePhasePillStyles = createStyles((theme: AppTheme) => ({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 0,
    },
    phasePillText: {
        color: theme.palette.text.inverted,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
}));
