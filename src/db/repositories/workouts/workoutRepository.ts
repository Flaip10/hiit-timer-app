import { db } from '../client';
import { createWorkoutRepository } from './workoutRepositoryFactory';

export {
    createWorkoutRepository,
    type Clock,
    type CreateWorkoutRepositoryArgs,
    type RepositoryDb,
    type WorkoutRepository,
    type WorkoutRepositoryApi,
} from './workoutRepositoryFactory';

export const workoutRepositoryApi = createWorkoutRepository({ db });

export const {
    createWorkoutVersion,
    deleteWorkoutVersionIfOrphan,
    getWorkoutByVersionId,
    insertWorkoutVersion,
    workoutRepository,
} = workoutRepositoryApi;
