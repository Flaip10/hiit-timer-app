import { createContext, useContext, type RefObject } from 'react';
import type { View } from 'react-native';

export interface MainContainerKeyboardContextValue {
    isKeyboardReadyForInputOverlays: boolean;
    scrollFocusedInputIntoView: (targetRef: RefObject<View | null>) => void;
}

const MainContainerKeyboardContext =
    createContext<MainContainerKeyboardContextValue | null>(null);

export const MainContainerKeyboardProvider =
    MainContainerKeyboardContext.Provider;

export const useMainContainerKeyboard = () =>
    useContext(MainContainerKeyboardContext);
