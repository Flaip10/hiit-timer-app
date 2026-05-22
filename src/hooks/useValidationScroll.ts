import { createRef, useCallback, useRef, type RefObject } from 'react';
import type { View } from 'react-native';

export interface ValidationScrollTargetError {
    targetId: string;
}

interface UseValidationScrollArgs {
    scrollTargetIntoView: (
        targetRef: RefObject<View | null>,
        viewportRatio?: number,
    ) => void;
}

interface UseValidationScrollResult {
    refFor: (targetId: string) => RefObject<View | null>;
    scrollToFirstError: (errors: ValidationScrollTargetError[]) => void;
}

export const useValidationScroll = ({
    scrollTargetIntoView,
}: UseValidationScrollArgs): UseValidationScrollResult => {
    const targetRefs = useRef<
        Partial<Record<string, RefObject<View | null>>>
    >({});

    const refFor = useCallback(
        (targetId: string): RefObject<View | null> => {
            const existing = targetRefs.current[targetId];
            if (existing) return existing;

            const next = createRef<View>();
            targetRefs.current[targetId] = next;
            return next;
        },
        [],
    );

    const scrollToFirstError = useCallback(
        (errors: ValidationScrollTargetError[]): void => {
            if (errors.length === 0) return;

            const firstError = errors[0];

            scrollTargetIntoView(refFor(firstError.targetId));
        },
        [refFor, scrollTargetIntoView],
    );

    return { refFor, scrollToFirstError };
};
