import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type RunLayoutMode = 'default' | 'compact' | 'minimal';

export interface RunLayoutModeResult {
    mode: RunLayoutMode;
    shouldShowNextExercise: boolean;
}

interface RunLayoutEstimateInput {
    height: number;
    fontScale: number;
}

// Tuned from tested font scales 1, 1.15, 1.3 using midpoint buckets.
const NORMAL_FONT_MAX = 1.075;
const MEDIUM_FONT_MAX = 1.225;
const LARGE_FONT_MAX = 1.4;

// Tuned from tested heights 640, 738.18, 824.91 with gentle buffers.
const DEFAULT_HEIGHT_MIN = 800;
const NEXT_EXERCISE_HEIGHT_MIN = 700;

const estimateRunLayoutMode = (
    input: RunLayoutEstimateInput,
): RunLayoutModeResult => {
    let result: RunLayoutModeResult;

    if (input.fontScale <= NORMAL_FONT_MAX) {
        if (input.height >= DEFAULT_HEIGHT_MIN) {
            result = { mode: 'default', shouldShowNextExercise: true };
        } else if (input.height >= NEXT_EXERCISE_HEIGHT_MIN) {
            result = { mode: 'compact', shouldShowNextExercise: true };
        } else {
            result = { mode: 'compact', shouldShowNextExercise: false };
        }
    } else if (input.fontScale <= MEDIUM_FONT_MAX) {
        if (input.height >= DEFAULT_HEIGHT_MIN) {
            result = { mode: 'default', shouldShowNextExercise: true };
        } else if (input.height >= NEXT_EXERCISE_HEIGHT_MIN) {
            result = { mode: 'compact', shouldShowNextExercise: true };
        } else {
            result = { mode: 'compact', shouldShowNextExercise: false };
        }
    } else if (input.fontScale <= LARGE_FONT_MAX) {
        if (input.height >= DEFAULT_HEIGHT_MIN) {
            result = { mode: 'compact', shouldShowNextExercise: true };
        } else if (input.height >= NEXT_EXERCISE_HEIGHT_MIN) {
            result = { mode: 'minimal', shouldShowNextExercise: true };
        } else {
            result = { mode: 'minimal', shouldShowNextExercise: false };
        }
    } else {
        result = {
            mode: 'minimal',
            shouldShowNextExercise: input.height >= NEXT_EXERCISE_HEIGHT_MIN,
        };
    }

    return result;
};

export const useRunLayoutMode = (): RunLayoutModeResult => {
    const { height, fontScale } = useWindowDimensions();
    const result = useMemo(
        () => estimateRunLayoutMode({ height, fontScale }),
        [height, fontScale],
    );

    return result;
};
