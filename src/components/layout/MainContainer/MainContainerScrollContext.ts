import { createContext, useContext, type RefObject } from 'react';
import type { View } from 'react-native';

export interface MainContainerScrollContextValue {
    canShowInputDropdowns: boolean;
    scrollTargetIntoView: (
        targetRef: RefObject<View | null>,
        viewportRatio?: number,
    ) => void;
    scrollFocusedInputIntoView: (
        targetRef: RefObject<View | null>,
        viewportRatio?: number,
    ) => void;
}

const MainContainerScrollContext =
    createContext<MainContainerScrollContextValue | null>(null);

export const MainContainerScrollProvider = MainContainerScrollContext.Provider;

export const useMainContainerScroll = () =>
    useContext(MainContainerScrollContext);
