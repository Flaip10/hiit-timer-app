import type { Phase, Step } from '@core/timer';

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

export const computeRemainingWorkoutSec = (
    steps: Step[],
    stepIndex: number,
    remainingCurrentStepSec: number
): number => {
    return steps.reduce((acc, s, idx) => {
        if (s.label === 'PREP') return acc;

        if (idx > stepIndex) return acc + (s.durationSec ?? 0);
        if (idx === stepIndex) return acc + remainingCurrentStepSec;
        return acc;
    }, 0);
};

export const computeSetProgress = (
    steps: Step[],
    currentStep: Step,
    remainingMs: number
): number => {
    const currentBlockIdx = currentStep.blockIdx;
    const currentSetIdx = currentStep.setIdx;

    let totalSetDurationMs = 0;
    let elapsedInSetMs = 0;

    for (let i = 0; i < steps.length; i += 1) {
        const s = steps[i];

        // only that block+set
        if (s.blockIdx !== currentBlockIdx || s.setIdx !== currentSetIdx) {
            continue;
        }

        // no PREP in set progress
        if (s.label === 'PREP') continue;

        // no REST between sets
        if (s.label === 'REST' && s.id.startsWith('rest-set-')) continue;

        const stepDurationMs = (s.durationSec ?? 0) * 1000;
        totalSetDurationMs += stepDurationMs;

        if (s === currentStep) {
            const clampedRemaining = Math.min(
                stepDurationMs,
                Math.max(0, remainingMs)
            );
            elapsedInSetMs += stepDurationMs - clampedRemaining;
        } else {
            const indexOfCurrent = steps.indexOf(currentStep);
            const indexOfS = i;
            if (indexOfS < indexOfCurrent) {
                elapsedInSetMs += stepDurationMs;
            }
        }
    }

    if (totalSetDurationMs <= 0) return 0;

    const raw = elapsedInSetMs / totalSetDurationMs;
    return Math.min(1, Math.max(0, raw));
};
