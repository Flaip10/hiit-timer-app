import { createRef, useCallback, useRef, type RefObject } from 'react';
import type { View } from 'react-native';

export interface ValidationScrollTargetError<TargetId extends string> {
    targetId: TargetId;
}

interface UseValidationScrollArgs {
    scrollTargetIntoView: (
        targetRef: RefObject<View | null>,
        viewportRatio?: number,
    ) => void;
    viewportRatio?: number;
}

interface UseValidationScrollResult<TargetId extends string> {
    refFor: (targetId: TargetId) => RefObject<View | null>;
    scrollToFirstError: (
        errors: ValidationScrollTargetError<TargetId>[],
    ) => void;
}

export const useValidationScroll = <TargetId extends string>({
    scrollTargetIntoView,
    viewportRatio = 0.25,
}: UseValidationScrollArgs): UseValidationScrollResult<TargetId> => {
    const targetRefs = useRef<
        Partial<Record<TargetId, RefObject<View | null>>>
    >({});

    const refFor = useCallback((targetId: TargetId): RefObject<View | null> => {
        const existing = targetRefs.current[targetId];
        if (existing) return existing;

        const next = createRef<View>();
        targetRefs.current[targetId] = next;
        return next;
    }, []);

    const scrollToFirstError = useCallback(
        (errors: ValidationScrollTargetError<TargetId>[]): void => {
            if (errors.length === 0) return;

            const firstError = errors[0];

            scrollTargetIntoView(refFor(firstError.targetId), viewportRatio);
        },
        [refFor, scrollTargetIntoView, viewportRatio],
    );

    return { refFor, scrollToFirstError };
};
