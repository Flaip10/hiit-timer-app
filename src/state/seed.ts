import { useWorkouts } from './useWorkouts';
import { uid } from '../core/id';
import type { Workout } from '../core/entities';

export const ensureSeed = (): void => {
    const { order, add } = useWorkouts.getState();
    if (order.length > 0) return;

    const w: Workout = {
        id: uid(),
        name: 'HIIT 10-20',
        blocks: [
            {
                id: uid(),
                restBetweenExercisesSec: 15,
                exercises: [
                    {
                        id: uid(),
                        name: 'Jump Rope',
                        pace: { type: 'time', workSec: 20 },
                        setScheme: { sets: 8, restBetweenSetsSec: 10 },
                    },
                    {
                        id: uid(),
                        name: 'Rest',
                        pace: { type: 'time', workSec: 10 },
                        setScheme: { sets: 8, restBetweenSetsSec: 0 },
                    },
                ],
            },
        ],
    };

    add(w);
};
