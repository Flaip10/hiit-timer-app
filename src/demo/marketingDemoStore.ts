import { create } from 'zustand';

export type MarketingDemoTarget =
    | 'home'
    | 'workouts'
    | 'summary'
    | 'editor'
    | 'run-work'
    | 'run-rest'
    | 'run-finished'
    | 'history'
    | 'settings';

interface MarketingDemoStoreState {
    activeScreenshotTarget: MarketingDemoTarget | null;
    setActiveScreenshotTarget: (target: MarketingDemoTarget) => void;
}

export const useMarketingDemoStore = create<MarketingDemoStoreState>((set) => ({
    activeScreenshotTarget: null,
    setActiveScreenshotTarget: (target) =>
        set(() => ({
            activeScreenshotTarget: target,
        })),
}));
