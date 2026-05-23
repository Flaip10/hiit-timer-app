import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import { useRemoveWorkout } from '@src/data/workouts';
import { useListSelection } from '@src/hooks/useListSelection';
import { useTheme } from '@src/theme/ThemeProvider';

interface UseWorkoutsSelectionResult {
    screenTitle: string;
    topBarOptions: readonly TopBarOption[];
    topBarLeftAction?: TopBarDirectAction;
    topBarRightAction?: TopBarDirectAction;
    isSelectMode: boolean;
    isSelected: (id: string) => boolean;
    toggleItem: (id: string) => void;
    hasPendingRemoval: boolean;
    confirmTitle: string;
    confirmMessage: string;
    requestRemoval: (id: string) => void;
    confirmRemoval: () => void;
    cancelRemoval: () => void;
}

export const useWorkoutsSelection = (): UseWorkoutsSelectionResult => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const removeWorkout = useRemoveWorkout();
    const [pendingRemovalIds, setPendingRemovalIds] = useState<string[]>([]);

    const {
        isSelectMode,
        selectedCount,
        hasSelection,
        enterSelectMode,
        exitSelectMode,
        toggleItem,
        isSelected,
        selectedIds,
    } = useListSelection();

    const requestRemoval = useCallback((id: string) => {
        setPendingRemovalIds([id]);
    }, []);

    const requestSelectedRemoval = useCallback(() => {
        setPendingRemovalIds([...selectedIds]);
    }, [selectedIds]);

    const confirmRemoval = useCallback(() => {
        for (const id of pendingRemovalIds) {
            removeWorkout.mutate(id);
        }

        setPendingRemovalIds([]);
        if (isSelectMode) {
            exitSelectMode();
        }
    }, [exitSelectMode, isSelectMode, pendingRemovalIds, removeWorkout]);

    const cancelRemoval = useCallback(() => {
        setPendingRemovalIds([]);
    }, []);

    const topBarOptions = useMemo<readonly TopBarOption[]>(() => {
        return [
            {
                id: 'select',
                label: t('common.selectMode.enter'),
                icon: 'checkmark',
                onPress: enterSelectMode,
            },
        ];
    }, [enterSelectMode, t]);

    let screenTitle = t('workouts.title');
    let topBarLeftAction: TopBarDirectAction | undefined;
    let topBarRightAction: TopBarDirectAction | undefined;

    if (isSelectMode) {
        screenTitle = t('common.selectMode.countSelected', {
            count: selectedCount,
        });
        topBarLeftAction = { icon: 'close', onPress: exitSelectMode };
        topBarRightAction = {
            icon: 'trash',
            color: hasSelection
                ? theme.palette.icon.error
                : theme.palette.text.secondary,
            disabled: !hasSelection,
            onPress: requestSelectedRemoval,
        };
    }

    let confirmTitle = t('workouts.confirmRemove.title');
    let confirmMessage = t('workouts.confirmRemove.message');

    if (pendingRemovalIds.length !== 1) {
        confirmTitle = t('workouts.confirmRemoveBulk.title', {
            count: pendingRemovalIds.length,
        });
        confirmMessage = t('workouts.confirmRemoveBulk.message', {
            count: pendingRemovalIds.length,
        });
    }

    return {
        screenTitle,
        topBarOptions,
        topBarLeftAction,
        topBarRightAction,
        isSelectMode,
        isSelected,
        toggleItem,
        hasPendingRemoval: pendingRemovalIds.length > 0,
        confirmTitle,
        confirmMessage,
        requestRemoval,
        confirmRemoval,
        cancelRemoval,
    };
};
