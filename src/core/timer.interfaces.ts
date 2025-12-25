// ------- RUN DATA PREPARE -----------------

export type Phase = 'PREP' | 'WORK' | 'REST';

export interface Step {
    id: string;
    label: Phase;
    durationSec: number;

    blockIdx: number;
    exIdx: number; // -1 for PREP (otherwise 0..)
    setIdx: number; // -1 for PREP (otherwise 0..)

    name?: string;
    nextName?: string;
}

export interface RunMeta {
    // UI
    blockTitles: (string | null)[];
    exerciseNamesByBlock: string[][];

    // planned structure
    exercisesCountByBlock: number[];
    plannedSetsByBlock: number[];

    totalBlocks: number;
    totalSetsForRun: number;
    totalExercisesForRun: number;

    // Keys are `${blockIdx}:${setIdx}`
    lastWorkStepIndexBySet: Map<string, number>;
    workStepsCountBySet: Map<string, number>;

    // blockIdx -> last WORK step index in that block
    lastWorkStepIndexByBlock: Map<number, number>;

    // blockIdx -> first step index in that block (including PREP if present)
    firstStepIndexByBlock: Map<number, number>;

    // seconds
    blockTotalSecByBlock: number[];
    remainingBlockAfterStepIndexSec: number[];

    // For progress bar pills
    setTotalMsByKey: Map<string, number>; // `${blockIdx}:${setIdx}` -> total counted ms
    setElapsedBeforeMsByStepIndex: number[]; // per stepIndex
    setStepMsByStepIndex: number[]; // per stepIndex (0 if not counted)

    runKey: string;
}

export interface RunPlan {
    steps: Step[];
    meta: RunMeta;
}

// --------- TIMER ENGINE --------

export interface TimerSnapshot {
    stepIndex: number;
    running: boolean;
    remainingMs: number; // ground truth
    remainingSec: number; // UI seconds (ceil)
}

export interface CountdownUiTick {
    remainingMs: number;
    remainingSec: number; // UI seconds (ceil)
}

export type StepEndReason = 'natural' | 'skip' | 'stop';
export type RunFinishReason = 'natural' | 'stop';

export type TimerEvent =
    | { type: 'STATE_SYNC'; nowMs: number; snapshot: TimerSnapshot }
    | {
          type: 'RUN_STARTED';
          nowMs: number;
          stepIndex: number;
          step: Step | null;
      }
    | {
          type: 'RUN_PAUSED';
          nowMs: number;
          stepIndex: number;
          step: Step | null;
          remainingMs: number;
      }
    | {
          type: 'RUN_RESUMED';
          nowMs: number;
          stepIndex: number;
          step: Step | null;
          remainingMs: number;
      }
    | {
          type: 'RUN_FINISHED';
          nowMs: number;
          stepIndex: number;
          step: Step | null;
          reason: RunFinishReason;
      }
    | { type: 'STEP_STARTED'; nowMs: number; stepIndex: number; step: Step }
    | {
          type: 'STEP_ENDED';
          nowMs: number;
          stepIndex: number;
          step: Step;
          reason: StepEndReason;
      };

export interface TimerCallbacks {
    /**
     * Explicit event stream.
     */
    onTimerEvent?: (event: TimerEvent) => void;

    /**
     * UI refresh only (1Hz aligned). Must NOT be used as authority for stepIndex/running.
     * Use this for rendering the countdown and mirroring remainingMs in state.
     */
    onCountdownUiTick?: (tick: CountdownUiTick) => void;
}
