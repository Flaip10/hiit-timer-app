import { db as appDb } from './client';
import { createExerciseDefinitionRepository } from './repositories/exerciseDefinitions/exerciseDefinitionRepositoryFactory';
import { systemClock, type Clock } from './repositories/repositoryClock';
import {
    createWorkoutRepository,
    type RepositoryDb,
} from './repositories/workouts/workoutRepositoryFactory';
import {
    createWorkoutExerciseUsageRepository,
    type WorkoutExerciseUsageRepository,
} from './repositories/workouts/workoutExerciseUsageRepositoryFactory';
import { createWorkoutSessionRepository } from './repositories/workoutSessions/workoutSessionRepositoryFactory';
import { createExerciseDefinitionService } from './services/exerciseDefinitions/exerciseDefinitionServiceFactory';
import {
    createWorkoutExerciseDefinitionService,
    type WorkoutExerciseDefinitionService,
} from './services/workouts/workoutExerciseDefinitionServiceFactory';
import {
    createWorkoutService,
    type WorkoutService,
} from './services/workouts/workoutServiceFactory';
import {
    createWorkoutSessionService,
    type WorkoutSessionService,
} from './services/workoutSessions/workoutSessionServiceFactory';
import type { ExerciseDefinitionService } from './services/exerciseDefinitions/exerciseDefinitionServiceFactory';
import type {
    WorkoutRepository,
    WorkoutRepositoryApi,
} from './repositories/workouts/workoutRepositoryFactory';
import type { WorkoutSessionRepository } from './repositories/workoutSessions/workoutSessionRepositoryFactory';

export interface CreateDbServicesArgs {
    clock?: Clock;
    db: RepositoryDb;
}

export interface DbServices {
    exerciseDefinitionService: ExerciseDefinitionService;
    workoutExerciseDefinitionService: WorkoutExerciseDefinitionService;
    workoutExerciseUsageRepository: WorkoutExerciseUsageRepository;
    workoutRepository: WorkoutRepository;
    workoutRepositoryApi: WorkoutRepositoryApi;
    workoutService: WorkoutService;
    workoutSessionRepository: WorkoutSessionRepository;
    workoutSessionService: WorkoutSessionService;
}

export const createDbServices = ({
    clock = systemClock,
    db,
}: CreateDbServicesArgs): DbServices => {
    const exerciseDefinitionRepository = createExerciseDefinitionRepository({
        db,
    });
    const workoutExerciseUsageRepository = createWorkoutExerciseUsageRepository(
        {
            db,
        },
    );
    const exerciseDefinitionService = createExerciseDefinitionService({
        clock,
        exerciseDefinitionRepository,
        workoutExerciseUsageRepository,
    });
    const workoutExerciseDefinitionService =
        createWorkoutExerciseDefinitionService({
            exerciseDefinitionService,
        });
    const workoutRepositoryApi = createWorkoutRepository({
        clock,
        db,
        workoutExerciseDefinitionService,
    });
    const workoutSessionRepository = createWorkoutSessionRepository({
        db,
        workoutExerciseDefinitionService,
        workoutRepositoryApi,
    });
    const workoutService = createWorkoutService({
        workoutRepository: workoutRepositoryApi.workoutRepository,
    });
    const workoutSessionService = createWorkoutSessionService({
        workoutSessionRepository,
    });

    return {
        exerciseDefinitionService,
        workoutExerciseDefinitionService,
        workoutExerciseUsageRepository,
        workoutRepository: workoutRepositoryApi.workoutRepository,
        workoutRepositoryApi,
        workoutService,
        workoutSessionRepository,
        workoutSessionService,
    };
};

export const dbServices = createDbServices({ db: appDb });

export const {
    exerciseDefinitionService,
    workoutService,
    workoutSessionService,
} = dbServices;
