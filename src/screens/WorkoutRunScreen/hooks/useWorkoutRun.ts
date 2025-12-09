import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { Router } from 'expo-router';

import { createTimer, type Step, type Phase } from '@core/timer';
import type { Workout } from '@core/entities';

import { computeRemainingWorkoutSec, computeSetProgress } from '../helpers';
import {
    cancelAnimation,
    Easing,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

type UseWorkoutRunArgs = {
    steps: Step[];
    workout?: Workout;
    shouldAutoStart: boolean;
    router: Router;
};

export const useWorkoutRun = ({
    steps,
    workout,
    shouldAutoStart,
    router,
}: UseWorkoutRunArgs) => {
    const engineRef = useRef<ReturnType<typeof createTimer> | null>(null);
    const autoStartedRef = useRef(false);

    const [stepIndex, setStepIndex] = useState(0);
    const [remaining, setRemaining] = useState(0); // seconds (UI)
    const [remainingMs, setRemainingMs] = useState(0); // ms (for smooth progress)
    const [running, setRunning] = useState(false);

    // -------- tracking completion / partial completion --------

    // How many sets we fully completed per block (index aligned with workout.blocks)
    const [completedSetsByBlock, setCompletedSetsByBlock] = useState<number[]>(
        []
    );

    // Total seconds of *completed sets* (used for partial completion time)
    const [elapsedCompletedSec, setElapsedCompletedSec] = useState(0);

    // Forced finish flag (user ended workout early via End + confirm)
    const [forceFinished, setForceFinished] = useState(false);

    // Internal refs for completion logic
    const completedSetKeysRef = useRef<Set<string>>(new Set());
    const lastStepIndexRef = useRef<number | null>(null);
    const finalStepProcessedRef = useRef(false);

    // -------- block transition / pause state --------

    const [awaitingBlockContinue, setAwaitingBlockContinue] = useState(false);
    const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(
        null
    );

    // Reset completion + block pause tracking whenever workout/steps change
    useEffect(() => {
        const blocksLength = workout?.blocks?.length ?? 0;
        setCompletedSetsByBlock(Array(blocksLength).fill(0));
        setElapsedCompletedSec(0);
        completedSetKeysRef.current = new Set();
        lastStepIndexRef.current = null;
        finalStepProcessedRef.current = false;
        setForceFinished(false);
        setAwaitingBlockContinue(false);
        setCurrentBlockIndex(null);
    }, [steps, workout]);

    // Precompute mapping (blockIdx,setIdx) -> last step index in that set
    const lastSetStepIndexMap = useMemo(() => {
        const map = new Map<string, number>();

        steps.forEach((s, idx) => {
            const { blockIdx, setIdx } = s;
            if (blockIdx == null || setIdx == null) return;
            const key = `${blockIdx}-${setIdx}`;
            const prev = map.get(key);
            if (prev == null || idx > prev) {
                map.set(key, idx);
            }
        });

        return map;
    }, [steps]);

    // Precompute total planned duration of each set (sum of all its steps)
    const setDurationSecMap = useMemo(() => {
        const map = new Map<string, number>();

        steps.forEach((s) => {
            const { blockIdx, setIdx, durationSec } = s;
            if (blockIdx == null || setIdx == null) return;
            const key = `${blockIdx}-${setIdx}`;
            const prev = map.get(key) ?? 0;
            map.set(key, prev + (durationSec ?? 0));
        });

        return map;
    }, [steps]);

    // Precompute the index of the *first* step for each block
    const firstStepIndexByBlock = useMemo(() => {
        const map = new Map<number, number>();

        steps.forEach((s, idx) => {
            const b = s.blockIdx;
            if (b == null) return;
            const prev = map.get(b);
            if (prev == null || idx < prev) {
                map.set(b, idx);
            }
        });

        return map;
    }, [steps]);

    // Planned sets per block, to know if workout is fully completed
    const plannedSetsByBlock = useMemo(
        () => workout?.blocks?.map((b) => b.sets ?? 0) ?? [],
        [workout]
    );

    // -------- engine setup --------
    useEffect(() => {
        if (steps.length === 0) return;

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

    // -------- derived values (pure logic) --------

    const step: Step | undefined = steps[stepIndex];

    const phase: Phase = (step?.label ?? 'PREP') as Phase;
    const isSetRest =
        phase === 'REST' && step?.id && step.id.startsWith('rest-set-');

    // Natural finish (ran all steps until the end)
    const naturalFinished =
        !!step && !running && stepIndex === steps.length - 1 && remaining <= 0;

    // Final "finished" flag also true when user forced finish
    const isFinished = forceFinished || naturalFinished;

    // continuous phase progress (0..1) based on ms
    const durationMs = (step?.durationSec ?? 0) * 1000;
    const safeRemainingMs =
        durationMs > 0 ? Math.max(0, Math.min(remainingMs, durationMs)) : 0;

    const phaseProgress =
        durationMs > 0 ? (durationMs - safeRemainingMs) / durationMs : 0;

    // workout time left (skipping PREP)
    const remainingWorkoutSec =
        steps.length > 0
            ? computeRemainingWorkoutSec(steps, stepIndex, remaining)
            : 0;

    // set pill progress (0..1, continuous)
    const setProgress =
        step != null ? computeSetProgress(steps, step, remainingMs) : 0;

    const isAtStepStart =
        step != null ? remaining === (step.durationSec ?? 0) : false;

    const primaryLabel: 'Start' | 'Pause' | 'Resume' | 'Done' = isFinished
        ? 'Done'
        : running
          ? 'Pause'
          : isAtStepStart
            ? 'Start'
            : 'Resume';

    // workout structure (block, sets, exercise names)
    const blocks = workout?.blocks ?? [];
    const currentBlock = step ? blocks[step.blockIdx] : undefined;
    const totalSets = currentBlock?.sets ?? 0;

    const getExerciseNameForStep = (s: Step | undefined): string | null => {
        if (!s || s.label !== 'WORK') return null;

        const blk = blocks[s.blockIdx];
        const ex = blk?.exercises?.[s.exIdx];

        if (!ex) return null;

        const trimmed = ex.name?.trim();

        return trimmed && trimmed.length > 0
            ? trimmed
            : `Exercise ${s.exIdx + 1}`;
    };

    let currentExerciseName: string | null = null;
    let nextExerciseName: string | null = null;

    if (step) {
        if (phase === 'PREP') {
            const upcoming: Step[] = [];

            for (let i = stepIndex; i < steps.length; i += 1) {
                const candidate = steps[i];
                if (candidate.label === 'WORK') {
                    upcoming.push(candidate);
                    if (upcoming.length === 2) break;
                }
            }

            const firstWork = upcoming[0];
            const secondWork = upcoming[1];

            currentExerciseName = getExerciseNameForStep(firstWork);
            nextExerciseName = getExerciseNameForStep(secondWork);
        } else {
            if (phase === 'WORK') {
                currentExerciseName = getExerciseNameForStep(step);
            } else if (phase === 'REST') {
                for (let i = stepIndex - 1; i >= 0; i -= 1) {
                    const prev = steps[i];
                    if (prev.label === 'WORK') {
                        currentExerciseName = getExerciseNameForStep(prev);
                        break;
                    }
                }
            }

            for (let i = stepIndex + 1; i < steps.length; i += 1) {
                const future = steps[i];
                if (future.label === 'WORK') {
                    nextExerciseName = getExerciseNameForStep(future);
                    break;
                }
            }
        }
    }

    // ===== Track fully completed sets & elapsed time =====

    const processCompletedStepIndex = (completedIndex: number) => {
        const completedStep = steps[completedIndex];
        if (!completedStep) return;

        const { blockIdx, setIdx } = completedStep;
        if (blockIdx == null || setIdx == null) return;

        const key = `${blockIdx}-${setIdx}`;
        const lastIdxForSet = lastSetStepIndexMap.get(key);

        // Only mark when we just finished the *last* step of that set
        if (lastIdxForSet == null || lastIdxForSet !== completedIndex) return;
        if (completedSetKeysRef.current.has(key)) return;

        completedSetKeysRef.current.add(key);

        // Increment completed sets for that block
        setCompletedSetsByBlock((prev) => {
            if (blockIdx < 0) return prev;
            const next = prev.slice();
            if (blockIdx >= next.length) return next;
            next[blockIdx] = (next[blockIdx] ?? 0) + 1;
            return next;
        });

        // Add the full planned duration of that set
        const setDurationSec = setDurationSecMap.get(key) ?? 0;
        if (setDurationSec > 0) {
            setElapsedCompletedSec((prev) => prev + setDurationSec);
        }
    };

    // When stepIndex changes, the previous step has just finished
    useEffect(() => {
        if (steps.length === 0) return;

        const prevIndex = lastStepIndexRef.current;

        if (prevIndex == null) {
            lastStepIndexRef.current = stepIndex;
            return;
        }

        if (stepIndex !== prevIndex) {
            processCompletedStepIndex(prevIndex);
            lastStepIndexRef.current = stepIndex;
        }
    }, [stepIndex, steps, lastSetStepIndexMap, setDurationSecMap]);

    // When workout naturally finishes, ensure the last step is processed once
    useEffect(() => {
        if (!naturalFinished) return;
        if (finalStepProcessedRef.current) return;

        finalStepProcessedRef.current = true;
        if (stepIndex >= 0 && stepIndex < steps.length) {
            processCompletedStepIndex(stepIndex);
        }
    }, [
        naturalFinished,
        stepIndex,
        steps,
        lastSetStepIndexMap,
        setDurationSecMap,
    ]);

    // -------- breathingPhase: 0..1 scalar for UI (timer + arc) --------
    const breathingPhase = useSharedValue(0);

    // Are we in the last 3 seconds of *this step* (independent of running)?
    const isBreathingWindow = useMemo(() => {
        if (!step || !step.durationSec) return false;
        return remaining > 0 && remaining <= 3;
    }, [step, remaining]);

    // Only animate when in the window *and* actually running
    const shouldAnimateBreathing = isBreathingWindow && running;

    useEffect(() => {
        cancelAnimation(breathingPhase);

        if (isFinished) {
            breathingPhase.value = withTiming(0, {
                duration: 150,
                easing: Easing.out(Easing.quad),
            });
            return;
        }

        if (!isBreathingWindow) {
            breathingPhase.value = withTiming(0, {
                duration: 150,
                easing: Easing.out(Easing.quad),
            });
            return;
        }

        if (!shouldAnimateBreathing) {
            // paused inside the window → freeze
            return;
        }

        breathingPhase.value = withRepeat(
            withSequence(
                withTiming(1, {
                    duration: 500,
                    easing: Easing.linear,
                }),
                withTiming(0, {
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                })
            ),
            -1,
            false
        );
    }, [isBreathingWindow, shouldAnimateBreathing, isFinished, breathingPhase]);

    // -------- block-level pause between blocks --------

    useEffect(() => {
        if (!step) {
            setCurrentBlockIndex(null);
            setAwaitingBlockContinue(false);
            return;
        }

        const blockIdx = step.blockIdx;
        setCurrentBlockIndex(blockIdx ?? null);

        if (
            blockIdx == null ||
            blockIdx === 0 || // no pause before first block
            forceFinished ||
            naturalFinished
        ) {
            setAwaitingBlockContinue(false);
            return;
        }

        const firstIndexForBlock = firstStepIndexByBlock.get(blockIdx);

        // If we just entered the *first* step of this block, pause and show "Prepare"
        if (firstIndexForBlock != null && stepIndex === firstIndexForBlock) {
            const engine = engineRef.current;
            engine?.pause();
            setRunning(false);
            setAwaitingBlockContinue(true);
        } else {
            // Inside the block -> normal running
            setAwaitingBlockContinue(false);
        }
    }, [
        step,
        stepIndex,
        firstStepIndexByBlock,
        forceFinished,
        naturalFinished,
    ]);

    // -------- "fully completed" flag --------

    const totalPlannedSets = plannedSetsByBlock.reduce(
        (acc, val) => acc + (val ?? 0),
        0
    );
    const totalCompletedSets = completedSetsByBlock.reduce(
        (acc, val) => acc + (val ?? 0),
        0
    );

    const isFullyCompleted =
        !forceFinished &&
        naturalFinished &&
        totalPlannedSets > 0 &&
        totalCompletedSets >= totalPlannedSets;

    // -------- controls --------

    const handleStart = () => engineRef.current?.start();
    const handlePause = () => engineRef.current?.pause();
    const handleResume = () => engineRef.current?.resume();
    const handleSkip = () => engineRef.current?.skip();

    const handleEnd = () => {
        handlePause();
        router.back();
    };

    const handleDone = () => {
        router.back();
    };

    const handleForceFinish = () => {
        const engine = engineRef.current;
        engine?.stop();
        setRunning(false);
        setForceFinished(true);
        setAwaitingBlockContinue(false);
    };

    const handlePrimary = () => {
        if (isFinished) {
            handleDone();
            return;
        }

        if (awaitingBlockContinue) {
            setAwaitingBlockContinue(false);
        }

        if (running) {
            handlePause();
        } else if (isAtStepStart) {
            handleStart();
        } else {
            handleResume();
        }
    };

    return {
        // raw timer state
        remaining,
        running,

        // derived timer info
        step,
        phase,
        isSetRest,
        phaseProgress,
        remainingWorkoutSec,
        setProgress,
        isFinished,
        primaryLabel,

        // workout structure / names
        currentBlock,
        totalSets,
        currentBlockIndex,
        currentExerciseName,
        nextExerciseName,

        // completion info
        completedSetsByBlock,
        elapsedCompletedSec,
        isFullyCompleted,
        awaitingBlockContinue,

        // breathing scalar for UI (0..1)
        breathingPhase,

        // controls
        handlePrimary,
        handleSkip,
        handleEnd,
        handleDone,
        handleForceFinish,
    };
};
