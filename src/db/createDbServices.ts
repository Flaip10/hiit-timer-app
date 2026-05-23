import { createExerciseDefinitionRepository } from './repositories/exerciseDefinitions/exerciseDefinitionRepositoryFactory';
import { systemClock, type Clock } from './repositories/repositoryClock';
import {
    createWorkoutRepository,
    type RepositoryDb,
} from './repositories/workouts/workoutRepositoryFactory';
import { createWorkoutSessionRepository } from './repositories/workoutSessions/workoutSessionRepositoryFactory';
import { createExerciseDefinitionService } from './services/exerciseDefinitions/exerciseDefinitionServiceFactory';
import {
    createWorkoutService,
    type WorkoutService,
} from './services/workouts/workoutServiceFactory';
import {
    createWorkoutSessionService,
    type WorkoutSessionService,
} from './services/workoutSessions/workoutSessionServiceFactory';
import type { ExerciseDefinitionService } from './services/exerciseDefinitions/exerciseDefinitionServiceFactory';
import type { WorkoutRepository } from './repositories/workouts/workoutRepositoryFactory';
import type { WorkoutSessionRepository } from './repositories/workoutSessions/workoutSessionRepositoryFactory';

export interface CreateDbServicesArgs {
    clock?: Clock;
    db: RepositoryDb;
}

export interface DbServices {
    exerciseDefinitionService: ExerciseDefinitionService;
    workoutRepository: WorkoutRepository;
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
    const exerciseDefinitionService = createExerciseDefinitionService({
        clock,
        exerciseDefinitionRepository,
    });
    const workoutRepository = createWorkoutRepository({
        db,
    });
    const workoutSessionRepository = createWorkoutSessionRepository({
        db,
    });
    const workoutService = createWorkoutService({
        clock,
        exerciseDefinitionService,
        workoutRepository,
        workoutSessionRepository,
    });
    const workoutSessionService = createWorkoutSessionService({
        exerciseDefinitionService,
        workoutRepository,
        workoutSessionRepository,
    });

    return {
        exerciseDefinitionService,
        workoutRepository,
        workoutService,
        workoutSessionRepository,
        workoutSessionService,
    };
};
