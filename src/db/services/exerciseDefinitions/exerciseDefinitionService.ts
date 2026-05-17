import { exerciseDefinitionRepository } from '../../repositories/exerciseDefinitions/exerciseDefinitionRepository';
import { workoutExerciseUsageRepository } from '../../repositories/workouts/workoutExerciseUsageRepository';
import { createExerciseDefinitionService } from './exerciseDefinitionServiceFactory';

export {
    createExerciseDefinitionService,
    type CreateUserExerciseDefinitionInput,
    type CreateExerciseDefinitionServiceArgs,
    type ExerciseDefinitionService,
    type UpdateExerciseDefinitionInput,
    type UpdateExerciseDefinitionMode,
} from './exerciseDefinitionServiceFactory';

export const exerciseDefinitionService = createExerciseDefinitionService({
    exerciseDefinitionRepository,
    workoutExerciseUsageRepository,
});
