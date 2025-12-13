import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Step } from '@src/core/timer';

export interface EngineSnapshot {
    running: boolean;
    remainingMs: number;
    currentStep: Step | null;
}

export interface StartRunPayload {
    steps: Step[];
    totalSets: number;
    snapshot?: Partial<EngineSnapshot>;
}

export interface WorkoutRunState {
    steps: Step[];
    totalSets: number;

    running: boolean;
    remainingMs: number;
    currentStep: Step | null;

    startRun: (payload: StartRunPayload) => void;
    resetRun: () => void;
    setEngineSnapshot: (snap: EngineSnapshot) => void;
}

export const useWorkoutRunStore = create<WorkoutRunState>()(
    immer((set) => ({
        steps: [],
        totalSets: 1,

        running: false,
        remainingMs: 0,
        currentStep: null,

        breathingPhase: null,

        startRun: ({ steps, totalSets, snapshot }) =>
            set((s) => {
                s.steps = steps;
                s.totalSets = Math.max(1, totalSets || 1);

                s.running = snapshot?.running ?? false;
                s.remainingMs = snapshot?.remainingMs ?? 0;
                s.currentStep = snapshot?.currentStep ?? steps[0] ?? null;
            }),

        resetRun: () =>
            set((s) => {
                s.steps = [];
                s.totalSets = 1;

                s.running = false;
                s.remainingMs = 0;
                s.currentStep = null;
            }),

        setEngineSnapshot: (snap) =>
            set((s) => {
                s.running = snap.running;
                s.remainingMs = snap.remainingMs;
                s.currentStep = snap.currentStep;
            }),
    }))
);
