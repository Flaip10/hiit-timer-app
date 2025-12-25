import type { Phase, RunMeta, Step } from '@src/core/timer';
import { clamp } from 'react-native-reanimated';
import { msToSeconds } from '@src/helpers/time.helpers';

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

export const getProgressRangeFromMeta = (
    meta: RunMeta,
    stepIndex: number,
    currentStep: Step
) => {
    // rest between sets freezes at 100%
    if (
        currentStep.label === 'REST' &&
        currentStep.id.startsWith('rest-set-')
    ) {
        return { stepDurationMs: 0, startProgress: 1, endProgress: 1 };
    }

    const b = currentStep.blockIdx;
    const s = currentStep.setIdx;
    if (b < 0 || s < 0) {
        return { stepDurationMs: 0, startProgress: 0, endProgress: 0 };
    }

    const kSet = `${b}:${s}`;
    const setTotalMs = meta.setTotalMsByKey.get(kSet) ?? 0;
    if (setTotalMs <= 0) {
        return { stepDurationMs: 0, startProgress: 0, endProgress: 0 };
    }

    const beforeMs = meta.setElapsedBeforeMsByStepIndex[stepIndex] ?? 0;
    const stepMs = meta.setStepMsByStepIndex[stepIndex] ?? 0;

    // stepMs === 0 means “not counted” (e.g., PREP) → freeze to startProgress
    const startProgress = beforeMs / setTotalMs;
    const endProgress = (beforeMs + stepMs) / setTotalMs;

    return {
        stepDurationMs: stepMs,
        startProgress: clamp(startProgress, 0, 1),
        endProgress: clamp(endProgress, 0, 1),
    };
};

export const msArrayToSecondsArray = (
    millisecondsByBlock: number[],
    roundingMode: Parameters<typeof msToSeconds>[1] = 'round'
): number[] => millisecondsByBlock.map((ms) => msToSeconds(ms, roundingMode));
