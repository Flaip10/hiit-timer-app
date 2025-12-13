import { useMemo } from 'react';
import type { Step } from '@core/timer';

type UseSetMapsArgs = {
    steps: Step[];
};

const setKey = (blockIdx: number, setIdx: number) => `${blockIdx}:${setIdx}`;

export const useSetMaps = ({ steps }: UseSetMapsArgs) => {
    const lastSetStepIndexMap = useMemo(() => {
        const map = new Map<string, number>();

        steps.forEach((s, idx) => {
            const { blockIdx, setIdx } = s;
            if (blockIdx == null || setIdx == null) return;

            const key = setKey(blockIdx, setIdx);
            const prev = map.get(key);

            if (prev == null || idx > prev) map.set(key, idx);
        });

        return map;
    }, [steps]);

    const setDurationSecMap = useMemo(() => {
        const map = new Map<string, number>();

        steps.forEach((s) => {
            const { blockIdx, setIdx } = s;
            if (blockIdx == null || setIdx == null) return;

            const key = setKey(blockIdx, setIdx);
            const prev = map.get(key) ?? 0;
            const dur = Math.max(0, s.durationSec ?? 0);

            map.set(key, prev + dur);
        });

        return map;
    }, [steps]);

    const firstStepIndexByBlock = useMemo(() => {
        const map = new Map<number, number>();

        steps.forEach((s, idx) => {
            const b = s.blockIdx;
            if (b == null) return;

            const prev = map.get(b);
            if (prev == null || idx < prev) map.set(b, idx);
        });

        return map;
    }, [steps]);

    return {
        lastSetStepIndexMap,
        setDurationSecMap,
        firstStepIndexByBlock,
    };
};
