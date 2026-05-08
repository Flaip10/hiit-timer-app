import React, { createContext, useContext, type ReactNode } from 'react';

import {
    useRunLayoutMode,
    type RunLayoutModeResult,
} from '../hooks/useRunLayoutMode';

const RunLayoutContext = createContext<RunLayoutModeResult | null>(null);

interface RunLayoutProviderProps {
    children: ReactNode;
}

export const RunLayoutProvider = ({ children }: RunLayoutProviderProps) => {
    const value = useRunLayoutMode();

    return (
        <RunLayoutContext.Provider value={value}>
            {children}
        </RunLayoutContext.Provider>
    );
};

export const useRunLayout = (): RunLayoutModeResult => {
    const context = useContext(RunLayoutContext);

    if (!context) {
        throw new Error('useRunLayout must be used within RunLayoutProvider');
    }

    return context;
};
