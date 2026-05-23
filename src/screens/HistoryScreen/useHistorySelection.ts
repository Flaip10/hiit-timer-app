import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import { useRemoveWorkoutSession } from '@src/data/workoutSessions';
import { useListSelection } from '@src/hooks/useListSelection';
import { useTheme } from '@src/theme/ThemeProvider';

interface UseHistorySelectionResult {
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
    confirmRemoval: () => void;
    cancelRemoval: () => void;
}

export const useHistorySelection = (): UseHistorySelectionResult => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const removeWorkoutSession = useRemoveWorkoutSession();
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

    const requestSelectedRemoval = useCallback(() => {
        setPendingRemovalIds([...selectedIds]);
    }, [selectedIds]);

    const confirmRemoval = useCallback(() => {
        for (const id of pendingRemovalIds) {
            removeWorkoutSession.mutate(id);
        }

        setPendingRemovalIds([]);
        if (isSelectMode) {
            exitSelectMode();
        }
    }, [exitSelectMode, isSelectMode, pendingRemovalIds, removeWorkoutSession]);

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

    let screenTitle = t('history.title');
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

    let confirmTitle = t('history.confirmRemoveBulk.title', { count: 1 });
    let confirmMessage = t('history.confirmRemoveBulk.message', { count: 1 });

    if (pendingRemovalIds.length !== 1) {
        confirmTitle = t('history.confirmRemoveBulk.title', {
            count: pendingRemovalIds.length,
        });
        confirmMessage = t('history.confirmRemoveBulk.message', {
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
        confirmRemoval,
        cancelRemoval,
    };
};
