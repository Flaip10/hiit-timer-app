import type { WorkoutBlock, Pace } from './entities';

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

export type Tick = {
    stepIndex: number;
    remainingSec: number;
    running: boolean;
};

// Monotonic timestamp helper
const startWallMs = Date.now();
const startPerf = performance.now();
const nowMs = (): number => startWallMs + (performance.now() - startPerf);

const workDuration = (p: Pace): number => (p.type === 'time' ? p.workSec : 0);

/** Builds workout steps from block-level structure */
export const buildSteps = (
    prepSec: number,
    blocks: WorkoutBlock[]
): { steps: Step[] } => {
    const steps: Step[] = [];
    let firstWorkAdded = false;

    blocks.forEach((block, bi) => {
        const L = block.exercises.length;
        const sets = Math.max(0, block.scheme.sets);

        for (let si = 0; si < sets; si++) {
            for (let ei = 0; ei < L; ei++) {
                const ex = block.exercises[ei];
                const pace = ex.paceOverride ?? block.defaultPace;
                const workSec = workDuration(pace);

                if (!firstWorkAdded && prepSec > 0) {
                    steps.push({
                        id: `prep-${bi}-${si}-${ei}`,
                        label: 'PREP',
                        durationSec: prepSec,
                        blockIdx: bi,
                        exIdx: ei,
                        setIdx: si,
                        name: ex.name,
                    });
                    firstWorkAdded = true;
                } else if (!firstWorkAdded) {
                    firstWorkAdded = true;
                }

                steps.push({
                    id: `work-${bi}-${si}-${ei}`,
                    label: 'WORK',
                    durationSec: workSec,
                    blockIdx: bi,
                    exIdx: ei,
                    setIdx: si,
                    name: ex.name,
                });

                const lastExerciseInSet = ei === L - 1;
                const restEx = block.scheme.restBetweenExercisesSec;
                if (!lastExerciseInSet && restEx > 0) {
                    steps.push({
                        id: `rest-ex-${bi}-${si}-${ei}`,
                        label: 'REST',
                        durationSec: restEx,
                        blockIdx: bi,
                        exIdx: ei,
                        setIdx: si,
                        name: ex.name,
                    });
                }
            }

            const lastSet = si === sets - 1;
            const restSet = block.scheme.restBetweenSetsSec;
            if (!lastSet && restSet > 0) {
                steps.push({
                    id: `rest-set-${bi}-${si}`,
                    label: 'REST',
                    durationSec: restSet,
                    blockIdx: bi,
                    exIdx: 0,
                    setIdx: si,
                });
            }
        }
    });

    steps.forEach((s, i) => {
        const next = steps[i + 1];
        if (next && next.label === 'WORK') s.nextName = next.name;
    });

    return { steps };
};

/** Timer engine with exact pause/resume semantics */
export const createTimer = (steps: Step[], onTick: (t: Tick) => void) => {
    let index = 0;
    let running = false;
    let endAt = 0;
    let pausedRemainMs: number | null = null;
    let raf: number | null = null;

    const issueTick = (remainMs: number) => {
        const secLeft = Math.ceil(Math.max(0, remainMs) / 1000);
        onTick({ stepIndex: index, remainingSec: secLeft, running });
    };

    const currentRemainMs = (): number => {
        if (!running) return pausedRemainMs ?? steps[index]?.durationSec * 1000;
        return Math.max(0, endAt - nowMs());
    };

    const loop = () => {
        if (!running) return;
        const msLeft = currentRemainMs();
        issueTick(msLeft);

        if (msLeft <= 0) {
            if (index < steps.length - 1) {
                index += 1;
                endAt = nowMs() + steps[index].durationSec * 1000;
                issueTick(steps[index].durationSec * 1000);
            } else {
                stop();
                return;
            }
        }
        raf = requestAnimationFrame(loop);
    };

    const start = () => {
        if (running) return;
        running = true;
        pausedRemainMs = null;
        endAt = nowMs() + steps[index].durationSec * 1000;
        issueTick(steps[index].durationSec * 1000);
        raf = requestAnimationFrame(loop);
    };

    const pause = () => {
        if (!running) return;
        running = false;
        if (raf != null) cancelAnimationFrame(raf);
        raf = null;
        pausedRemainMs = Math.max(0, endAt - nowMs());
        issueTick(pausedRemainMs);
    };

    const resume = () => {
        if (running) return;
        const remain = pausedRemainMs ?? steps[index].durationSec * 1000;
        endAt = nowMs() + remain;
        pausedRemainMs = null;
        running = true;
        issueTick(remain);
        raf = requestAnimationFrame(loop);
    };

    const skip = () => {
        if (index < steps.length - 1) {
            index += 1;
            if (running) {
                endAt = nowMs() + steps[index].durationSec * 1000;
                issueTick(steps[index].durationSec * 1000);
            } else {
                pausedRemainMs = steps[index].durationSec * 1000;
                issueTick(pausedRemainMs);
            }
        } else stop();
    };

    const stop = () => {
        running = false;
        if (raf != null) cancelAnimationFrame(raf);
        raf = null;
        pausedRemainMs = null;
        onTick({ stepIndex: index, remainingSec: 0, running });
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
