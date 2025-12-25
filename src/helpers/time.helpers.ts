export type RoundingMode = 'ceil' | 'floor';

export const msToSeconds = (
    ms: number,
    mode: 'floor' | 'ceil' | 'round' = 'round'
): number => {
    if (ms <= 0) return 0;

    switch (mode) {
        case 'floor':
            return Math.floor(ms / 1000);
        case 'ceil':
            return Math.ceil(ms / 1000);
        case 'round':
        default:
            return Math.round(ms / 1000);
    }
};
