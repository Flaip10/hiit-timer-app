import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const ARC_SIZE = 280;

export const useRunPhaseSectionStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        mainContainer: {
            flex: 1,
            width: '100%',
        },

        // ===== Block pause (between blocks) =====
        blockPauseContainer: {
            flex: 1,
            width: '100%',
            paddingHorizontal: 16,
            paddingBottom: 30,
            justifyContent: 'center',
            gap: 16,
        },
        blockPauseHint: {
            textAlign: 'center',
            color: theme.palette.text.muted,
        },

        // ===== Arc + phase content =====
        arcContainer: {
            flex: 1,
            paddingTop: 30,
            alignItems: 'center',
            justifyContent: 'flex-start',
        },

        arcWrapper: {
            width: ARC_SIZE,
            height: ARC_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',

            paddingTop: 60,
        },

        timer: {
            position: 'absolute',
            color: theme.palette.text.primary,
            fontSize: 96,
            fontVariant: ['tabular-nums'],
            marginTop: 60,
        },

        // Exercises Info
        exerciseInfoContainer: {
            width: '100%',
            paddingHorizontal: 10,
            gap: 12,
        },

        // Finishing zone
        finishedContainer: {
            flex: 1,
            width: '100%',
            gap: 16,
            justifyContent: 'center',
        },
    })
);
