import { useMemo } from 'react';

import type { Workout } from '@src/core/entities/entities';
import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';
import {
    getMarketingDemoEditorWorkout,
    getMarketingDemoHistorySessionById,
    getMarketingDemoHistorySessions,
    getMarketingDemoPrimaryWorkout,
    getMarketingDemoRunPlan,
    getMarketingDemoRunSnapshot,
    getMarketingDemoWorkoutById,
    getMarketingDemoWorkouts,
    type MarketingDemoRunSnapshot,
} from './marketingFixtures';
import { useAllWorkouts, useWorkout } from '@src/state/useWorkouts';
import {
    useRecentSessions,
    useWorkoutHistory,
} from '@src/state/stores/useWorkoutHistory';
import {
    type MarketingDemoTarget,
    useMarketingDemoStore,
} from './marketingDemoStore';

export interface MarketingDemoState {
    isEnabled: boolean;
    screenshotTarget: MarketingDemoTarget | null;
}

export interface MarketingDemoHistoryState {
    order: string[];
    sessions: Record<string, WorkoutSession>;
}

export interface ScreenshotHubDestination {
    target: MarketingDemoTarget;
    title: string;
    description: string;
    pathname:
        | '/'
        | '/workouts'
        | '/workouts/[id]'
        | '/workouts/edit'
        | '/run'
        | '/history'
        | '/settings';
    params?: Record<string, string>;
}

export const SCREENSHOT_HUB_DESTINATIONS: ScreenshotHubDestination[] = [
    {
        target: 'home',
        title: 'Home',
        description: 'Logo, welcome area, Quick Workout, and recent sessions.',
        pathname: '/',
    },
    {
        target: 'workouts',
        title: 'Workouts List',
        description: 'Six staged workouts with favorites and varied durations.',
        pathname: '/workouts',
    },
    {
        target: 'summary',
        title: 'Workout Summary',
        description: 'Primary workout with blocks, exercise count, and duration.',
        pathname: '/workouts/[id]',
        params: { id: 'demo-workout-full-body-hiit' },
    },
    {
        target: 'editor',
        title: 'Workout Editor',
        description: 'Multi-block editor state with a clear interval structure.',
        pathname: '/workouts/edit',
    },
    {
        target: 'run-work',
        title: 'Run Work Phase',
        description: 'High-energy live state without timer progression.',
        pathname: '/run',
    },
    {
        target: 'run-rest',
        title: 'Run Rest Phase',
        description: 'Recovery state with a visibly different visual rhythm.',
        pathname: '/run',
    },
    {
        target: 'run-finished',
        title: 'Run Finished',
        description: 'Completion state with session stats ready to capture.',
        pathname: '/run',
    },
    {
        target: 'history',
        title: 'History',
        description: 'Recent completed sessions with believable activity.',
        pathname: '/history',
    },
    {
        target: 'settings',
        title: 'Settings',
        description: 'Appearance, sound, language, and app identity.',
        pathname: '/settings',
    },
];

export const MARKETING_DEMO_ENABLED = true;

export const resolveMarketingDemoState = (
    screenshotTarget: MarketingDemoTarget | null
): MarketingDemoState => {
    return {
        isEnabled: MARKETING_DEMO_ENABLED,
        screenshotTarget,
    };
};

export const useMarketingDemoState = (): MarketingDemoState => {
    const screenshotTarget = useMarketingDemoStore(
        (state) => state.activeScreenshotTarget
    );

    return useMemo(
        () => resolveMarketingDemoState(screenshotTarget),
        [screenshotTarget]
    );
};

const resolveFallbackWorkout = (
    id: string | undefined,
    demoState: MarketingDemoState
): Workout | undefined => {
    if (!demoState.isEnabled) return undefined;

    const fixtureById = getMarketingDemoWorkoutById(id);
    if (fixtureById) return fixtureById;

    switch (demoState.screenshotTarget) {
        case 'summary':
        case 'editor':
        case 'run-work':
        case 'run-rest':
        case 'run-finished':
            return getMarketingDemoPrimaryWorkout();
        default:
            return undefined;
    }
};

export const useResolvedAllWorkouts = (): Workout[] => {
    const demoState = useMarketingDemoState();
    const persisted = useAllWorkouts();

    return demoState.isEnabled ? getMarketingDemoWorkouts() : persisted;
};

export const useResolvedWorkout = (id?: string): Workout | undefined => {
    const demoState = useMarketingDemoState();
    const persisted = useWorkout(id);

    return demoState.isEnabled
        ? resolveFallbackWorkout(id, demoState)
        : persisted;
};

export const useResolvedRecentSessions = (limit = 5): WorkoutSession[] => {
    const demoState = useMarketingDemoState();
    const persisted = useRecentSessions(limit);

    return demoState.isEnabled
        ? getMarketingDemoHistorySessions().slice(0, limit)
        : persisted;
};

export const useResolvedHistoryState = (): MarketingDemoHistoryState => {
    const demoState = useMarketingDemoState();
    const persistedOrder = useWorkoutHistory((state) => state.order);
    const persistedSessions = useWorkoutHistory((state) => state.sessions);

    return useMemo(() => {
        if (!demoState.isEnabled) {
            return {
                order: persistedOrder,
                sessions: persistedSessions,
            };
        }

        const demoSessions = getMarketingDemoHistorySessions();
        const sessions = demoSessions.reduce<Record<string, WorkoutSession>>(
            (acc, session) => {
                acc[session.id] = session;
                return acc;
            },
            {}
        );

        return {
            order: demoSessions.map((session) => session.id),
            sessions,
        };
    }, [demoState.isEnabled, persistedOrder, persistedSessions]);
};

export const useResolvedHistorySession = (
    sessionId?: string
): WorkoutSession | undefined => {
    const demoState = useMarketingDemoState();
    const persisted = useWorkoutHistory((state) =>
        sessionId ? state.sessions[sessionId] : undefined
    );

    return demoState.isEnabled
        ? getMarketingDemoHistorySessionById(sessionId)
        : persisted;
};

export const useMarketingDemoEditorWorkout = (): Workout | null => {
    const demoState = useMarketingDemoState();

    return useMemo(() => {
        if (!demoState.isEnabled || demoState.screenshotTarget !== 'editor') {
            return null;
        }

        return getMarketingDemoEditorWorkout();
    }, [demoState.isEnabled, demoState.screenshotTarget]);
};

export const useMarketingDemoRunOverride = (): {
    workout: Workout | null;
    snapshot: MarketingDemoRunSnapshot | null;
    plan: ReturnType<typeof getMarketingDemoRunPlan> | null;
} => {
    const demoState = useMarketingDemoState();

    return useMemo(() => {
        if (!demoState.isEnabled) {
            return {
                workout: null,
                snapshot: null,
                plan: null,
            };
        }

        if (
            demoState.screenshotTarget !== 'run-work' &&
            demoState.screenshotTarget !== 'run-rest' &&
            demoState.screenshotTarget !== 'run-finished'
        ) {
            return {
                workout: null,
                snapshot: null,
                plan: null,
            };
        }

        return {
            workout: getMarketingDemoPrimaryWorkout(),
            snapshot: getMarketingDemoRunSnapshot(demoState.screenshotTarget),
            plan: getMarketingDemoRunPlan(),
        };
    }, [demoState]);
};
