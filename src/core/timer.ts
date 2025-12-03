import type { WorkoutBlock } from './entities';

export type Phase = 'PREP' | 'WORK' | 'REST';

export type Step = {
    id: string;
    label: Phase;
    durationSec: number;
    blockIdx: number;
    exIdx: number;
    setIdx: number;
    name?: string;
    nextName?: string;
};

/**
 * Builds workout steps from block-level structure.
 *
 * For now, non-timed exercises (mode === 'reps') are ignored in the run.
 */
export const buildSteps = (
    prepSec: number,
    blocks: WorkoutBlock[]
): { steps: Step[] } => {
    const steps: Step[] = [];
    let firstWorkAdded = false;

    blocks.forEach((block, bi) => {
        // Only consider exercises that have a timed duration
        const workExercises = block.exercises
            .map((ex, exIdx) => ({ ex, exIdx }))
            .filter(({ ex }) => ex.mode === 'time' && ex.value > 0);

        const L = workExercises.length;
        const sets = Math.max(0, block.sets);

        if (L === 0 || sets === 0) return;

        for (let si = 0; si < sets; si++) {
            for (let wi = 0; wi < L; wi++) {
                const { ex, exIdx } = workExercises[wi];
                const workSec = ex.value;

                // Optional global PREP at the very beginning
                if (!firstWorkAdded && prepSec > 0) {
                    steps.push({
                        id: `prep-${bi}-${si}-${exIdx}`,
                        label: 'PREP',
                        durationSec: prepSec,
                        blockIdx: bi,
                        exIdx,
                        setIdx: si,
                        name: ex.name,
                    });
                    firstWorkAdded = true;
                } else if (!firstWorkAdded) {
                    // no prep, but we still mark that we've hit the first WORK
                    firstWorkAdded = true;
                }

                // WORK step for this exercise
                steps.push({
                    id: `work-${bi}-${si}-${exIdx}`,
                    label: 'WORK',
                    durationSec: workSec,
                    blockIdx: bi,
                    exIdx,
                    setIdx: si,
                    name: ex.name,
                });

                // REST between exercises (within same set, but only between timed ones)
                const lastExerciseInSet = wi === L - 1;
                const restEx = block.restBetweenExercisesSec;
                if (!lastExerciseInSet && restEx > 0) {
                    steps.push({
                        id: `rest-ex-${bi}-${si}-${exIdx}`,
                        label: 'REST',
                        durationSec: restEx,
                        blockIdx: bi,
                        exIdx,
                        setIdx: si,
                        name: ex.name,
                    });
                }
            }

            // REST between sets (after the last exercise of the set)
            const lastSet = si === sets - 1;
            const restSet = block.restBetweenSetsSec;
            if (!lastSet && restSet > 0) {
                steps.push({
                    id: `rest-set-${bi}-${si}`,
                    label: 'REST',
                    durationSec: restSet,
                    blockIdx: bi,
                    exIdx: 0, // arbitrary; the run UI only cares about setIdx here
                    setIdx: si,
                });
            }
        }
    });

    // Fill nextName only for steps whose *next* step is WORK
    steps.forEach((s, i) => {
        const next = steps[i + 1];
        if (next && next.label === 'WORK') s.nextName = next.name;
    });

    return { steps };
};

// --------- timer engine ------------------------------

const startWallMs = Date.now();
const startPerf = performance.now();
const nowMs = (): number => startWallMs + (performance.now() - startPerf);

export type Tick = {
    stepIndex: number;
    remainingSec: number;
    remainingMs: number;
    running: boolean;
};

// Timer engine with ~5 Hz tick (good enough for smooth UI)
export const createTimer = (steps: Step[], onTick: (t: Tick) => void) => {
    const TICK_MS = 200; // 5 times per second

    let index = 0;
    let running = false;
    let endAt = 0; // wall-clock ms when current step should end
    let pausedRemainMs: number | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const currentStep = () => steps[index];

    const issueTick = (remainMsRaw: number) => {
        const remainMs = Math.max(0, remainMsRaw);
        const secLeft = Math.ceil(remainMs / 1000);
        onTick({
            stepIndex: index,
            remainingSec: secLeft,
            remainingMs: remainMs,
            running,
        });
    };

    const currentRemainMs = (): number => {
        const step = currentStep();
        if (!step) return 0;

        if (!running) {
            const fallback = (step.durationSec ?? 0) * 1000;
            return pausedRemainMs ?? fallback;
        }

        return Math.max(0, endAt - nowMs());
    };

    const clearTimer = () => {
        if (intervalId != null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    const loop = () => {
        if (!running) return;

        const msLeft = currentRemainMs();

        if (msLeft <= 0) {
            // step finished – move to next or stop
            if (index < steps.length - 1) {
                index += 1;
                const next = currentStep();
                const durMs = (next?.durationSec ?? 0) * 1000;
                endAt = nowMs() + durMs;
                issueTick(durMs);
            } else {
                // workout finished
                stop();
            }
            return;
        }

        // normal tick
        issueTick(msLeft);
    };

    const startInterval = () => {
        clearTimer();
        intervalId = setInterval(loop, TICK_MS);
    };

    const start = () => {
        if (running || steps.length === 0) return;

        const step = currentStep();
        const durMs = (step?.durationSec ?? 0) * 1000;

        running = true;
        pausedRemainMs = null;
        endAt = nowMs() + durMs;

        issueTick(durMs);
        startInterval();
    };

    const pause = () => {
        if (!running) return;

        const remain = currentRemainMs();
        running = false;
        pausedRemainMs = remain;
        clearTimer();
        issueTick(remain);
    };

    const resume = () => {
        if (running || steps.length === 0) return;

        const step = currentStep();
        const fallback = (step?.durationSec ?? 0) * 1000;
        const remain = pausedRemainMs ?? fallback;

        running = true;
        pausedRemainMs = null;
        endAt = nowMs() + remain;

        issueTick(remain);
        startInterval();
    };

    const skip = () => {
        if (steps.length === 0) return;

        if (index < steps.length - 1) {
            index += 1;
            const step = currentStep();
            const durMs = (step?.durationSec ?? 0) * 1000;

            if (running) {
                endAt = nowMs() + durMs;
                issueTick(durMs);
            } else {
                pausedRemainMs = durMs;
                issueTick(durMs);
            }
        } else {
            stop();
        }
    };

    const stop = () => {
        running = false;
        clearTimer();
        pausedRemainMs = null;

        const step = currentStep();
        if (!step) {
            onTick({
                stepIndex: index,
                remainingSec: 0,
                remainingMs: 0,
                running,
            });
            return;
        }

        onTick({
            stepIndex: index,
            remainingSec: 0,
            remainingMs: 0,
            running,
        });
    };

    return {
        start,
        pause,
        resume,
        skip,
        stop,
        getIndex: () => index,
        isRunning: () => running,
    };
};
