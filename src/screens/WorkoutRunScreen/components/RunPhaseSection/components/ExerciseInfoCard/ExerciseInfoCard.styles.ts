import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import type { RunLayoutMode } from '../../../../hooks/useRunLayoutMode';

interface ExerciseInfoCardStyleProps {
    layoutMode: RunLayoutMode;
}

const verticalSpacingFor = (mode: RunLayoutMode) => {
    if (mode === 'minimal') {
        return {
            headerMarginBottom: 0,
            bodyMarginVertical: 2,
        };
    }

    if (mode === 'compact') {
        return {
            headerMarginBottom: 2,
            bodyMarginVertical: 4,
        };
    }

    return {
        headerMarginBottom: 4,
        bodyMarginVertical: 6,
    };
};

const useExerciseInfoCardStyles = createStyles(
    (theme: AppTheme, props: ExerciseInfoCardStyleProps) => {
        const spacing = verticalSpacingFor(props.layoutMode);
        const checkSize = 24;

        return StyleSheet.create({
            currentCard: {
                width: '100%',
            },

            currentHeaderRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.headerMarginBottom,
            },

            currentTitle: {
                color: theme.palette.text.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
            },

            currentBodyRow: {
                marginVertical: spacing.bodyMarginVertical,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 12,
            },

            currentName: {
                color: theme.palette.text.primary,
            },

            checkCircle: {
                width: checkSize,
                height: checkSize,
                borderRadius: checkSize / 2,
                alignItems: 'center',
                justifyContent: 'center',
            },
        });
    },
);

export default useExerciseInfoCardStyles;
