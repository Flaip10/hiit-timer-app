import type { Workout } from '../entities/entities';

export const ARC_WORKOUT_KIND = 'arc-timer/workout' as const;
export const ARC_WORKOUT_EXTENSION = '.arcw' as const;
export const ARC_WORKOUT_MIME =
    'application/vnd.arctimer.workout+json' as const;

export type ArcWorkoutKind = typeof ARC_WORKOUT_KIND;

export interface ExportedWorkoutFileV1 {
    version: 1;
    kind: ArcWorkoutKind;
    exportedAt: string;
    app: {
        name: string;
        platform: 'mobile';
    };
    workout: Workout;
}
