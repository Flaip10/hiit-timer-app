import { useEffect, useMemo, useState } from 'react';

import type {
    Workout,
    WorkoutBlock,
    Exercise,
} from '@src/core/entities/entities';
import { uid } from '@core/id';

import {
    ensureExerciseCount,
    toPosInt,
    validateBlock,
    applyDurationToAll,
} from './helpers';

type UseBlockEditorArgs = {
    draft: Workout | null;
    blockId?: string;
};

export const useBlockEditor = ({ draft, blockId }: UseBlockEditorArgs) => {
    const [block, setBlock] = useState<WorkoutBlock | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // hydrate local block copy from draft
    useEffect(() => {
        if (!draft || !blockId) {
            setBlock(null);
            return;
        }

        const source = draft.blocks.find((b) => b.id === blockId);
        if (!source) {
            setBlock(null);
            return;
        }

        const copy: WorkoutBlock =
            typeof structuredClone === 'function'
                ? structuredClone(source)
                : (JSON.parse(JSON.stringify(source)) as WorkoutBlock);

        setBlock(copy);
    }, [draft, blockId]);

    // index for "Block 1" label
    const labelIndex = useMemo(() => {
        if (!draft || !blockId) return null;
        const idx = draft.blocks.findIndex((b) => b.id === blockId);
        return idx >= 0 ? idx + 1 : null;
    }, [draft, blockId]);

    const notFound = !draft || !block || !blockId || labelIndex == null;

    // ----- block-level setters -----
    const setField = <K extends keyof WorkoutBlock>(
        key: K,
        value: WorkoutBlock[K]
    ) =>
        setBlock((prev) =>
            prev ? ({ ...prev, [key]: value } as WorkoutBlock) : prev
        );

    const onTitle = (v: string) => setField('title', v);

    const onSets = (n: number) =>
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      sets: toPosInt(n, prev.sets),
                  }
                : prev
        );

    const onRestBetweenSets = (n: number) =>
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      restBetweenSetsSec: toPosInt(n, prev.restBetweenSetsSec),
                  }
                : prev
        );

    const onRestBetweenExercises = (n: number) =>
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      restBetweenExercisesSec: toPosInt(
                          n,
                          prev.restBetweenExercisesSec
                      ),
                  }
                : prev
        );

    const onNumExercises = (n: number) =>
        setBlock((prev) =>
            prev
                ? ensureExerciseCount(
                      prev,
                      Math.max(0, toPosInt(n, prev.exercises.length))
                  )
                : prev
        );

    // When user adjusts the "exercise length" stepper:
    //  - interpret it as seconds
    //  - apply to ALL exercises (mode='time', value=sec)
    const onExerciseLength = (n: number) =>
        setBlock((prev) => {
            if (!prev) return prev;

            const fallback =
                prev.exercises[0]?.value != null ? prev.exercises[0].value : 20;

            const sec = toPosInt(n, fallback);
            return applyDurationToAll(prev, sec);
        });

    // per-exercise changes
    const onExChange = (ei: number, next: Exercise) =>
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      exercises: prev.exercises.map((ex, j) =>
                          j === ei ? next : ex
                      ),
                  }
                : prev
        );

    const onAddExercise = () =>
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      exercises: [
                          ...prev.exercises,
                          {
                              id: uid(),
                              mode: 'time',
                              value:
                                  prev.exercises[0]?.value != null
                                      ? prev.exercises[0].value
                                      : 20,
                          },
                      ],
                  }
                : prev
        );

    const onRemoveExercise = (ei: number) =>
        setBlock((prev) =>
            prev
                ? {
                      ...prev,
                      exercises: prev.exercises.filter((_, j) => j !== ei),
                  }
                : prev
        );

    // ----- validation -----
    const validate = (): boolean => {
        const errs = validateBlock(block);
        setErrors(errs);
        return errs.length === 0;
    };

    return {
        block,
        labelIndex,
        notFound,
        errors,
        setErrors,
        saving,
        setSaving,

        onTitle,
        onSets,
        onRestBetweenSets,
        onRestBetweenExercises,
        onNumExercises,
        onExChange,
        onExerciseLength,
        onAddExercise,
        onRemoveExercise,
        validate,
    };
};
