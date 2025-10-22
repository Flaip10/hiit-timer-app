import type { WorkoutBlock } from '../core/entities';

let draftBlocks: WorkoutBlock[] | null = null;

export const setDraftBlocks = (blocks: WorkoutBlock[]) => {
    // store a deep copy to avoid external mutation
    draftBlocks = JSON.parse(JSON.stringify(blocks)) as WorkoutBlock[];
};

export const getDraftBlocks = (): WorkoutBlock[] | null => {
    return draftBlocks
        ? (JSON.parse(JSON.stringify(draftBlocks)) as WorkoutBlock[])
        : null;
};

export const updateDraftBlock = (index: number, next: WorkoutBlock) => {
    if (!draftBlocks) return;
    if (index < 0 || index >= draftBlocks.length) return;
    draftBlocks[index] = JSON.parse(JSON.stringify(next)) as WorkoutBlock;
};

export const clearDraftBlocks = () => {
    draftBlocks = null;
};
