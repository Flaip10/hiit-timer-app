import { useMemo } from 'react';

import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import type { ExerciseDefinitionListParams } from '@src/db/services/exerciseDefinitions/exerciseDefinitionServiceFactory';

import { useExerciseDefinitions } from './exerciseDefinitionQueries';

const DEBOUNCE_DELAY_MS = 150;
const QUERY_LIMIT = 25;
const DISPLAY_LIMIT = 6;

export const useExerciseDefinitionSuggestions = (input: string) => {
    const trimmedInput = input.trim();
    const debouncedInput = useDebouncedValue(trimmedInput, DEBOUNCE_DELAY_MS);
    const hasQuery = debouncedInput.length > 0;

    const params = useMemo<ExerciseDefinitionListParams>(
        () => ({
            filters: {
                availability: 'workout',
                namePrefix: debouncedInput,
            },
            pagination: {
                limit: QUERY_LIMIT,
            },
            scope: 'all',
        }),
        [debouncedInput],
    );

    const { data = [] } = useExerciseDefinitions(params, {
        enabled: hasQuery,
    });

    return useMemo(
        () => (hasQuery ? data.slice(0, DISPLAY_LIMIT) : []),
        [data, hasQuery],
    );
};
