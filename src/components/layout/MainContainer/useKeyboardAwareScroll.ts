import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type RefObject,
} from 'react';
import {
    Keyboard,
    Platform,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    type ScrollView,
    type View,
} from 'react-native';

import type { MainContainerScrollContextValue } from './MainContainerScrollContext';

const TARGET_VIEWPORT_RATIO = 0.42;
const LAYOUT_DELAY_MS = 32;
const DROPDOWN_SETTLE_DELAY_MS = 280;

interface UseKeyboardAwareScrollResult {
    handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollContextValue: MainContainerScrollContextValue;
    scrollViewRef: RefObject<ScrollView | null>;
    viewportRef: RefObject<View | null>;
}

export const useKeyboardAwareScroll = (): UseKeyboardAwareScrollResult => {
    const scrollViewRef = useRef<ScrollView | null>(null);
    const viewportRef = useRef<View | null>(null);
    const focusedTargetRef = useRef<{
        ref: RefObject<View | null>;
        viewportRatio?: number;
    } | null>(null);
    const currentScrollYRef = useRef(0);
    const isKeyboardVisibleRef = useRef(false);
    const layoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const [canShowInputDropdowns, setCanShowInputDropdowns] = useState(false);

    const clearPendingTimeouts = useCallback((): void => {
        if (layoutTimeoutRef.current) {
            clearTimeout(layoutTimeoutRef.current);
            layoutTimeoutRef.current = null;
        }

        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
            dropdownTimeoutRef.current = null;
        }
    }, []);

    const scrollMeasuredTargetIntoView = useCallback(
        (
            targetRef: RefObject<View | null>,
            viewportRatio: number | undefined,
            shouldScrollUp: boolean,
        ): void => {
            const scrollView = scrollViewRef.current;
            const viewport = viewportRef.current;
            const target = targetRef.current;
            if (!scrollView || !viewport || !target) return;

            viewport.measureInWindow(
                (
                    _viewportX: number,
                    viewportY: number,
                    _viewportWidth: number,
                    viewportHeight: number,
                ) => {
                    target.measureInWindow(
                        (_targetX: number, targetY: number) => {
                            const ratio =
                                viewportRatio ?? TARGET_VIEWPORT_RATIO;
                            const desiredTargetY =
                                viewportY + viewportHeight * ratio;
                            const scrollDelta = targetY - desiredTargetY;

                            if (!shouldScrollUp && scrollDelta <= 0) return;

                            scrollView.scrollTo({
                                y: Math.max(
                                    0,
                                    currentScrollYRef.current + scrollDelta,
                                ),
                                animated: true,
                            });
                        },
                    );
                },
            );
        },
        [],
    );

    const scrollTargetIntoView = useCallback(
        (targetRef: RefObject<View | null>, viewportRatio?: number): void => {
            scrollMeasuredTargetIntoView(targetRef, viewportRatio, true);
        },
        [scrollMeasuredTargetIntoView],
    );

    const scheduleScrollAndDropdown = useCallback((): void => {
        clearPendingTimeouts();
        layoutTimeoutRef.current = setTimeout(() => {
            layoutTimeoutRef.current = null;
            const focused = focusedTargetRef.current;

            if (focused) {
                scrollMeasuredTargetIntoView(
                    focused.ref,
                    focused.viewportRatio,
                    false,
                );
            }

            // Portal dropdowns should measure only after the scroll animation settles.
            dropdownTimeoutRef.current = setTimeout(() => {
                dropdownTimeoutRef.current = null;

                if (isKeyboardVisibleRef.current) {
                    setCanShowInputDropdowns(true);
                }
            }, DROPDOWN_SETTLE_DELAY_MS);
        }, LAYOUT_DELAY_MS);
    }, [clearPendingTimeouts, scrollMeasuredTargetIntoView]);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            isKeyboardVisibleRef.current = true;
            setCanShowInputDropdowns(false);
            scheduleScrollAndDropdown();
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            isKeyboardVisibleRef.current = false;
            setCanShowInputDropdowns(false);
            focusedTargetRef.current = null;
            clearPendingTimeouts();
        });
        const frameSubscription =
            Platform.OS === 'ios'
                ? Keyboard.addListener('keyboardWillChangeFrame', () => {
                      setCanShowInputDropdowns(false);
                      scheduleScrollAndDropdown();
                  })
                : null;

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
            frameSubscription?.remove();
            clearPendingTimeouts();
        };
    }, [clearPendingTimeouts, scheduleScrollAndDropdown]);

    const scrollFocusedInputIntoView = useCallback(
        (targetRef: RefObject<View | null>, viewportRatio?: number): void => {
            focusedTargetRef.current = { ref: targetRef, viewportRatio };

            if (isKeyboardVisibleRef.current) {
                setCanShowInputDropdowns(false);
                scheduleScrollAndDropdown();
            }
        },
        [scheduleScrollAndDropdown],
    );

    const scrollContextValue = useMemo(
        () => ({
            canShowInputDropdowns,
            scrollTargetIntoView,
            scrollFocusedInputIntoView,
        }),
        [
            canShowInputDropdowns,
            scrollFocusedInputIntoView,
            scrollTargetIntoView,
        ],
    );

    const handleScroll = (
        event: NativeSyntheticEvent<NativeScrollEvent>,
    ): void => {
        currentScrollYRef.current = event.nativeEvent.contentOffset.y;
    };

    return {
        handleScroll,
        scrollContextValue,
        scrollViewRef,
        viewportRef,
    };
};
