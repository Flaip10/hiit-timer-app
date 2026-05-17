import { db } from '../../client';
import { createExerciseDefinitionRepository } from './exerciseDefinitionRepositoryFactory';

export {
    createExerciseDefinitionRepository,
    type CreateExerciseDefinitionInput,
    type CreateExerciseDefinitionRepositoryArgs,
    type ExerciseDefinitionRepository,
    type ExerciseDefinitionRepositoryDb,
    type UpdateExerciseDefinitionInput,
} from './exerciseDefinitionRepositoryFactory';

export const exerciseDefinitionRepository =
    createExerciseDefinitionRepository({ db });
