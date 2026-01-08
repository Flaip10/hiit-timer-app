import { useEffect, useMemo, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';
import type { AudioSource } from 'expo-audio';

export interface UseStepBeepsArgs {
    stepKey: string | number; // use stepIndex or stepId to reset guards on step change
    running: boolean;
    remainingSec: number; // UI seconds (0..)
    stepDurationSec?: number; // needed for halfway beep
    enabled?: boolean;

    // Local asset
    beepSource?: AudioSource;
    finalBeepSource?: AudioSource;
    middleBeepSource?: AudioSource;

    halfwayMode?: 'floorHalf' | 'ceilHalf';
}

export interface UseStepBeepsApi {
    playTestBeep: () => void;
}

const defaultBeep = require('@assets/sounds/beep.mp3');
const defaultFinalBeep = require('@assets/sounds/beep_final.mp3');
const defaultMiddleBeep = require('@assets/sounds/beep_middle.mp3');

export const useStepBeeps = ({
    stepKey,
    running,
    remainingSec,
    stepDurationSec = 0,
    enabled = true,
    beepSource = defaultBeep,
    finalBeepSource = defaultFinalBeep,
    middleBeepSource = defaultMiddleBeep,
    halfwayMode = 'ceilHalf',
}: UseStepBeepsArgs): UseStepBeepsApi => {
    const beepPlayer = useAudioPlayer(beepSource);
    const finalPlayer = useAudioPlayer(finalBeepSource);
    const middlePlayer = useAudioPlayer(middleBeepSource);

    // Guard: handle each second only once
    const lastHandledSecondRef = useRef<number | null>(null);

    // “One-shot” triggers per step
    const halfwayFiredRef = useRef(false);

    // Track previous step state so we can fire "final" on step transition
    const prevStepKeyRef = useRef<string | number | null>(null);
    const prevRunningRef = useRef(false);
    const prevRemainingSecRef = useRef<number>(0);

    const halfwayRemainingSec = useMemo(() => {
        if (stepDurationSec <= 0) return null;

        const half = stepDurationSec / 2;
        return halfwayMode === 'floorHalf' ? Math.floor(half) : Math.ceil(half);
    }, [stepDurationSec, halfwayMode]);

    const play = (player: {
        seekTo: (sec: number) => void;
        play: () => void;
    }) => {
        try {
            // expo-audio does NOT auto-reset position after finishing
            player.seekTo(0);
            player.play();
        } catch {
            // ignore (audio focus, fast repeats, etc.)
        }
    };

    const playBeep = () => play(beepPlayer);
    const playFinal = () => play(finalPlayer);
    const playMiddle = () => play(middlePlayer);

    // Final beep on step change:
    // If the previous step was running and essentially finished (<= 1s remaining),
    // we fire the final beep when we observe the stepKey transition.
    useEffect(() => {
        if (!enabled) {
            prevStepKeyRef.current = stepKey;
            prevRunningRef.current = running;
            prevRemainingSecRef.current = remainingSec;
            return;
        }

        const prevKey = prevStepKeyRef.current;

        // Skip initial mount
        if (prevKey != null && prevKey !== stepKey) {
            const prevWasRunning = prevRunningRef.current;
            const prevRemain = prevRemainingSecRef.current;

            if (prevWasRunning && prevRemain <= 1) {
                playFinal();
            }
        }

        // update "previous" snapshot after handling transition
        prevStepKeyRef.current = stepKey;
        prevRunningRef.current = running;
        prevRemainingSecRef.current = remainingSec;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepKey, enabled]);

    // Keep previous snapshot updated during the step too
    useEffect(() => {
        prevRunningRef.current = running;
        prevRemainingSecRef.current = remainingSec;
    }, [running, remainingSec]);

    // Reset guards on step change
    useEffect(() => {
        lastHandledSecondRef.current = null;
        halfwayFiredRef.current = false;
    }, [stepKey]);

    useEffect(() => {
        if (!enabled) return;
        if (!running) return;

        // only handle a given remainingSec once
        if (lastHandledSecondRef.current === remainingSec) return;
        lastHandledSecondRef.current = remainingSec;

        // Halfway beep (once)
        if (
            !halfwayFiredRef.current &&
            halfwayRemainingSec != null &&
            remainingSec === halfwayRemainingSec &&
            remainingSec >= 5
        ) {
            halfwayFiredRef.current = true;
            playMiddle();
            return;
        }

        // Last 3 seconds
        if (remainingSec <= 3 && remainingSec >= 1) {
            playBeep();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, running, remainingSec, halfwayRemainingSec]);

    return {
        playTestBeep: playBeep,
    };
};

export default useStepBeeps;
