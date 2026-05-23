import { useState, useCallback } from 'react';

export interface UseListSelectionResult {
    isSelectMode: boolean;
    selectedIds: ReadonlySet<string>;
    selectedCount: number;
    hasSelection: boolean;
    enterSelectMode: () => void;
    /** Exits select mode and clears all selected ids. */
    exitSelectMode: () => void;
    toggleItem: (id: string) => void;
    selectAll: (ids: readonly string[]) => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
}

export const useListSelection = (): UseListSelectionResult => {
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
        new Set(),
    );

    const enterSelectMode = useCallback(() => {
        setIsSelectMode(true);
    }, []);

    const exitSelectMode = useCallback(() => {
        setIsSelectMode(false);
        setSelectedIds(new Set());
    }, []);

    const toggleItem = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback((ids: readonly string[]) => {
        setSelectedIds(new Set(ids));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const isSelected = useCallback(
        (id: string) => selectedIds.has(id),
        [selectedIds],
    );

    return {
        isSelectMode,
        selectedIds,
        selectedCount: selectedIds.size,
        hasSelection: selectedIds.size > 0,
        enterSelectMode,
        exitSelectMode,
        toggleItem,
        selectAll,
        clearSelection,
        isSelected,
    };
};
