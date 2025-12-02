import { Workout } from '../entities';

export type ExportedWorkoutFileV1 = {
    version: 1;
    kind: 'hiit-timer/workout';
    exportedAt: string; // ISO string
    app: {
        name: 'HIIT Timer';
        platform: 'mobile';
    };
    workout: Workout;
};
