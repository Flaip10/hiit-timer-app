export const setKey = (blockIdx: number, setIdx: number) =>
    `${blockIdx}:${setIdx}`;

export const clampInt = (v: unknown, fallback: number) => {
    const n = typeof v === 'number' ? v : fallback;
    if (!Number.isFinite(n)) return fallback;
    return Math.trunc(n);
};

export const normalizeName = (name: unknown, fallback: string) => {
    const s = typeof name === 'string' ? name.trim() : '';
    return s.length > 0 ? s : fallback;
};

export const normalizeTitle = (title: unknown): string | null => {
    const s = typeof title === 'string' ? title.trim() : '';
    return s.length > 0 ? s : null;
};

export const exDisplayName = (bi: number, exIdx: number, rawName: unknown) =>
    normalizeName(rawName, `Exercise ${exIdx + 1}`);
