export type Phase = 'PREP' | 'WORK' | 'REST';

export type Step = {
    id: string;
    label: Phase;
    durationSec: number;
    blockIdx: number;
    exIdx: number;
    setIdx: number;
    nextName?: string;
};

export type Tick = {
    stepIndex: number;
    remainingSec: number;
    running: boolean;
};

const startWallMs = Date.now();
const startPerf = performance.now();
const nowMs = (): number => startWallMs + (performance.now() - startPerf);

export const buildSteps = (
    prepSec: number,
    blocks: {
        restBetweenExercisesSec: number;
        exercises: {
            name: string;
            pace: { type: 'time' | 'reps'; workSec?: number };
            setScheme: { sets: number; restBetweenSetsSec: number };
        }[];
    }[]
): { steps: Step[]; names: string[] } => {
    const steps: Step[] = [];
    const names: string[] = [];
    blocks.forEach((b, bi) => {
        b.exercises.forEach((ex, ei) => {
            names.push(ex.name);
            const workSec =
                ex.pace.type === 'time' ? (ex.pace.workSec ?? 0) : 0;
            for (let si = 0; si < ex.setScheme.sets; si++) {
                if (si === 0 && prepSec > 0 && steps.length === 0) {
                    steps.push({
                        id: `prep-${bi}-${ei}-${si}`,
                        label: 'PREP',
                        durationSec: prepSec,
                        blockIdx: bi,
                        exIdx: ei,
                        setIdx: si,
                    });
                }
                steps.push({
                    id: `work-${bi}-${ei}-${si}`,
                    label: 'WORK',
                    durationSec: workSec,
                    blockIdx: bi,
                    exIdx: ei,
                    setIdx: si,
                });
                if (si < ex.setScheme.sets - 1) {
                    steps.push({
                        id: `restset-${bi}-${ei}-${si}`,
                        label: 'REST',
                        durationSec: ex.setScheme.restBetweenSetsSec,
                        blockIdx: bi,
                        exIdx: ei,
                        setIdx: si,
                    });
                }
            }
            if (ei < b.exercises.length - 1 && b.restBetweenExercisesSec > 0) {
                steps.push({
                    id: `restex-${bi}-${ei}`,
                    label: 'REST',
                    durationSec: b.restBetweenExercisesSec,
                    blockIdx: bi,
                    exIdx: ei,
                    setIdx: 0,
                });
            }
        });
    });
    steps.forEach((s, i) => {
        const next = steps[i + 1];
        if (next) s.nextName = names[Math.min(next.exIdx, names.length - 1)];
    });
    return { steps, names };
};

export const createTimer = (steps: Step[], onTick: (t: Tick) => void) => {
    let index = 0;
    let running = false;
    let endAt = 0;
    let raf: number | null = null;

    const issueTick = () => {
        const msLeft = Math.max(0, endAt - nowMs());
        const secLeft = Math.ceil(msLeft / 1000);
        onTick({ stepIndex: index, remainingSec: secLeft, running });
    };

    const loop = () => {
        if (!running) return;
        const msLeft = Math.max(0, endAt - nowMs());
        const secLeft = Math.ceil(msLeft / 1000);
        onTick({ stepIndex: index, remainingSec: secLeft, running });
        if (msLeft <= 0) {
            if (index < steps.length - 1) {
                index += 1;
                endAt = nowMs() + steps[index].durationSec * 1000;
                issueTick();
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
        endAt = nowMs() + steps[index].durationSec * 1000;
        issueTick();
        raf = requestAnimationFrame(loop);
    };

    const pause = () => {
        if (!running) return;
        running = false;
        if (raf != null) cancelAnimationFrame(raf);
        raf = null;
        const msLeft = Math.max(0, endAt - nowMs());
        endAt = nowMs() + msLeft; // keep invariant
        issueTick();
    };

    const resume = () => {
        if (running) return;
        running = true;
        raf = requestAnimationFrame(loop);
    };

    const skip = () => {
        if (index < steps.length - 1) {
            index += 1;
            endAt = nowMs() + steps[index].durationSec * 1000;
            issueTick();
        }
    };

    const addSeconds = (sec: number) => {
        endAt += sec * 1000;
    };
    const stop = () => {
        running = false;
        if (raf != null) cancelAnimationFrame(raf);
        raf = null;
        onTick({ stepIndex: index, remainingSec: 0, running });
    };

    return {
        start,
        pause,
        resume,
        skip,
        addSeconds,
        stop,
        getIndex: () => index,
        isRunning: () => running,
    };
};
