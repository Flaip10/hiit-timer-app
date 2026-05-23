import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from '../../client';
import { dbServices } from '../../dbServices';
import { createAsyncStorageMigration } from './migrateAsyncStorageWorkoutDataFactory';

export type {
    AsyncStorageWorkoutMigrationResult,
    MigrationContext,
} from './migrateAsyncStorageWorkoutDataFactory';

export const migrateAsyncStorageWorkoutData = createAsyncStorageMigration({
    asyncStorage: AsyncStorage,
    db,
    exerciseDefinitionService: dbServices.exerciseDefinitionService,
    workoutRepository: dbServices.workoutRepository,
    workoutSessionRepository: dbServices.workoutSessionRepository,
});
