import { useMemo } from 'react';

import type { Step } from '@core/timer';
import type { Workout } from '@core/entities';

type UseSetMapsArgs = {
    steps: Step[];
    workout?: Workout;
};

export const useSetMaps = ({ steps, workout }: UseSetMapsArgs) => {
    // (blockIdx,setIdx) -> last step index of that set
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

    // (blockIdx,setIdx) -> total planned duration of that set (seconds)
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

    // blockIdx -> first step index of that block
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

    // planned sets per block (used for “fully completed”)
    const plannedSetsByBlock = useMemo(
        () => workout?.blocks?.map((b) => b.sets ?? 0) ?? [],
        [workout]
    );

    return {
        lastSetStepIndexMap,
        setDurationSecMap,
        firstStepIndexByBlock,
        plannedSetsByBlock,
    };
};
