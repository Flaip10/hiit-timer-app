import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import type { RunLayoutMode } from '../../../../hooks/useRunLayoutMode';

interface NextExerciseCarouselStyleProps {
    layoutMode: RunLayoutMode;
}

const cardMetricsFor = (mode: RunLayoutMode, defaultPadding: number) => {
    if (mode === 'minimal') {
        return {
            marginTop: 0,
            padding: 10,
            gap: 2,
        };
    }

    if (mode === 'compact') {
        return {
            marginTop: 2,
            padding: 12,
            gap: 3,
        };
    }

    return {
        marginTop: 4,
        padding: defaultPadding,
        gap: 4,
    };
};

const useNextExerciseCarouselStyles = createStyles(
    (theme: AppTheme, props: NextExerciseCarouselStyleProps) => {
        const metrics = cardMetricsFor(
            props.layoutMode,
            theme.layout.card.padding,
        );

        return StyleSheet.create({
            nextCardWrapper: {
                marginTop: metrics.marginTop,
            },

            nextCard: {
                borderRadius: theme.layout.card.borderRadius,
                padding: metrics.padding,
                backgroundColor: theme.palette.background.card,
                gap: metrics.gap,
                borderWidth: 1,
                borderColor: theme.palette.border.subtle,
                overflow: 'hidden',
            },

            nextTitle: {
                color: theme.palette.text.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 2,
            },

            nextText: {
                color: theme.palette.text.primary,
                fontSize: 15,
                fontWeight: '600',
            },
        });
    },
);

export default useNextExerciseCarouselStyles;
