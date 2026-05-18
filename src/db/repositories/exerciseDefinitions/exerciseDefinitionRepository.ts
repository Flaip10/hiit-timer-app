import { db } from '../../client';
import { createExerciseDefinitionRepository } from './exerciseDefinitionRepositoryFactory';

export const exerciseDefinitionRepository =
    createExerciseDefinitionRepository({ db });
