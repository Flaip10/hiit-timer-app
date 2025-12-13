import type { Phase, Step } from '@core/timer';
import { clamp } from 'react-native-reanimated';

export const colorFor = (phase: Phase, isSetRest: boolean): string => {
    if (phase === 'WORK') return '#22C55E';
    if (phase === 'REST') {
        return isSetRest ? '#F97316' : '#60A5FA';
    }
    return '#F59E0B';
};

export const labelFor = (phase: Phase, isSetRest: boolean): string => {
    if (phase === 'WORK') return 'Work';
    if (phase === 'REST') return isSetRest ? 'Set rest' : 'Rest';
    return 'Prepare';
};

export const formatDuration = (sec: number): string => {
    const total = Math.max(0, Math.floor(sec));
    const m = Math.floor(total / 60)
        .toString()
        .padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

export const formatDurationVerbose = (sec: number): string => {
    const total = Math.max(0, Math.floor(sec));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    if (minutes === 0) {
        return `${seconds} sec`;
    }

    if (seconds === 0) {
        return `${minutes} min`;
    }

    const paddedSeconds = seconds.toString().padStart(2, '0');
    return `${minutes} min ${paddedSeconds} sec`;
};

export interface SetProgressRules {
    includeRestWithinSet: boolean; // usually true
    excludePrep: boolean; // true
    excludeRestBetweenSets: boolean; // true (rest-set-*)
}

export const defaultSetProgressRules: SetProgressRules = {
    includeRestWithinSet: true,
    excludePrep: true,
    excludeRestBetweenSets: true,
};

export const isCountedSetStep = (
    step: Step,
    rules: SetProgressRules = defaultSetProgressRules
): boolean => {
    if (rules.excludePrep && step.label === 'PREP') return false;

    if (
        rules.excludeRestBetweenSets &&
        step.label === 'REST' &&
        step.id.startsWith('rest-set-')
    ) {
        return false;
    }

    if (!rules.includeRestWithinSet && step.label === 'REST') return false;

    return true;
};

export interface StepProgressRange {
    setDurationMs: number;
    stepDurationMs: number;
    startProgress: number; // 0..1
    endProgress: number; // 0..1
}

export const computeStepProgressRangeInSet = (
    setSteps: Step[], // already filtered to current block+set, order preserved
    currentStep: Step,
    rules: SetProgressRules = defaultSetProgressRules
): StepProgressRange => {
    const currentId = currentStep.id;

    // Special-case: rest between sets should NOT reset progress.
    // It visually belongs to the *end* of the set, so freeze at 100%.
    const isRestBetweenSets =
        currentStep.label === 'REST' && currentId.startsWith('rest-set-');

    // Build counted timeline inside the set
    const countedSteps = setSteps.filter((s) => isCountedSetStep(s, rules));

    const durations = countedSteps.map((s) =>
        Math.max(0, (s.durationSec ?? 0) * 1000)
    );

    const setDurationMs = durations.reduce((a, b) => a + b, 0);

    if (setDurationMs <= 0) {
        return {
            setDurationMs: 0,
            stepDurationMs: 0,
            startProgress: 0,
            endProgress: 0,
        };
    }

    if (isRestBetweenSets) {
        return {
            setDurationMs,
            stepDurationMs: 0, // freeze
            startProgress: 1,
            endProgress: 1,
        };
    }

    const idx = countedSteps.findIndex((s) => s.id === currentId);

    // If current step is not part of the counted timeline (e.g., PREP),
    // return 0..0 so UI can freeze/reset as needed.
    if (idx === -1) {
        return {
            setDurationMs,
            stepDurationMs: 0,
            startProgress: 0,
            endProgress: 0,
        };
    }

    const stepDurationMs = durations[idx];

    let elapsedBeforeMs = 0;
    for (let i = 0; i < idx; i += 1) elapsedBeforeMs += durations[i];

    const startProgress = elapsedBeforeMs / setDurationMs;
    const endProgress = (elapsedBeforeMs + stepDurationMs) / setDurationMs;

    return {
        setDurationMs,
        stepDurationMs,
        startProgress: clamp(startProgress, 0, 1),
        endProgress: clamp(endProgress, 0, 1),
    };
};

export interface SetStepsResult {
    setSteps: Step[];
    blockIdx: number;
    setIdx: number;
}

export const getSetStepsForCurrentStep = (
    steps: Step[],
    currentStep: Step
): SetStepsResult => {
    const { blockIdx, setIdx } = currentStep;

    // Keep original order by filtering in-place order (no sort!)
    const setSteps = steps.filter(
        (s) => s.blockIdx === blockIdx && s.setIdx === setIdx
    );

    return { setSteps, blockIdx, setIdx };
};
