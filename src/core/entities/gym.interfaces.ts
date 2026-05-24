import type { UUID } from './entities';

export type GymSessionStatus = 'active' | 'completed' | 'discarded';

export interface GymPlanExercise {
    id: UUID;
    exerciseDefinitionId: UUID;
    sortIndex: number;
    targetSets?: number;
    targetReps?: number;
    targetWeightGrams?: number;
    targetDurationSec?: number;
    targetDistanceMeters?: number;
    restSec?: number;
    notes?: string;
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymPlanSection {
    id: UUID;
    title?: string;
    sortIndex: number;
    exercises: GymPlanExercise[];
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymPlan {
    id: UUID;
    name: string;
    description?: string;
    sections: GymPlanSection[];
    createdAtMs: number;
    updatedAtMs: number;
    isFavorite: boolean;
    isArchived: boolean;
}

export interface GymExerciseRecordSet {
    id: UUID;
    setIndex: number;
    reps?: number;
    weightGrams?: number;
    durationSec?: number;
    distanceMeters?: number;
    rpeTenths?: number;
    isWarmup: boolean;
    completedAtMs?: number;
    notes?: string;
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymExerciseRecord {
    id: UUID;
    exerciseDefinitionId: UUID;
    sourceGymPlanExerciseId?: UUID;
    sortIndex: number;
    startedAtMs?: number;
    completedAtMs?: number;
    notes?: string;
    sets: GymExerciseRecordSet[];
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymSession {
    id: UUID;
    startedAtMs: number;
    endedAtMs?: number;
    status: GymSessionStatus;
    sourceGymPlanId?: UUID;
    notes?: string;
    exerciseRecords: GymExerciseRecord[];
    createdAtMs: number;
    updatedAtMs: number;
}
