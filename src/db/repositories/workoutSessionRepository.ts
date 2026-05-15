import { db } from '../client';
import { workoutRepositoryApi } from './workoutRepository';
import { createWorkoutSessionRepository } from './workoutSessionRepositoryFactory';

export {
    createWorkoutSessionRepository,
    type CreateWorkoutSessionArgs,
    type CreateWorkoutSessionRepositoryArgs,
    type WorkoutSessionRepository,
} from './workoutSessionRepositoryFactory';

export const workoutSessionRepository = createWorkoutSessionRepository({
    db,
    workoutRepositoryApi,
});
