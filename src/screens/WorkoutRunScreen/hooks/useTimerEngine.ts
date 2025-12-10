import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { createTimer, type Step } from '@core/timer';

type UseTimerEngineArgs = {
    steps: Step[];
    shouldAutoStart: boolean;
};

export const useTimerEngine = ({
    steps,
    shouldAutoStart,
}: UseTimerEngineArgs) => {
    const engineRef = useRef<ReturnType<typeof createTimer> | null>(null);
    const autoStartedRef = useRef(false);

    const [stepIndex, setStepIndex] = useState(0);
    const [remaining, setRemaining] = useState(0); // seconds (UI)
    const [remainingMs, setRemainingMs] = useState(0); // ms (for smooth progress)
    const [running, setRunning] = useState(false);

    // -------- engine setup --------
    useEffect(() => {
        if (steps.length === 0) {
            return;
        }

        engineRef.current = createTimer(steps, (snapshot) => {
            setStepIndex(snapshot.stepIndex);
            setRemaining(snapshot.remainingSec);
            setRemainingMs(snapshot.remainingMs);
            setRunning(snapshot.running);
        });

        const firstDurationSec = steps[0]?.durationSec ?? 0;
        setStepIndex(0);
        setRemaining(firstDurationSec);
        setRemainingMs(firstDurationSec * 1000);
        setRunning(false);

        if (shouldAutoStart && !autoStartedRef.current) {
            autoStartedRef.current = true;
            engineRef.current?.start();
        }

        return () => {
            engineRef.current?.stop();
        };
    }, [steps, shouldAutoStart]);

    // -------- foreground resync --------
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                const engine = engineRef.current;
                if (!engine) return;
                if (engine.isRunning()) {
                    engine.pause();
                    engine.resume();
                }
            }
        });

        return () => {
            sub.remove();
        };
    }, []);

    const start = () => {
        engineRef.current?.start();
    };

    const pause = () => {
        engineRef.current?.pause();
    };

    const resume = () => {
        engineRef.current?.resume();
    };

    const skip = () => {
        engineRef.current?.skip();
    };

    const stop = () => {
        engineRef.current?.stop();
    };

    return {
        engineRef,
        stepIndex,
        remaining,
        remainingMs,
        running,
        start,
        pause,
        resume,
        skip,
        stop,
    };
};
