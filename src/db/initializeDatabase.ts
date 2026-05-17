import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../../drizzle/migrations';
import { dbServices } from './dbFactory';
import { db } from './client';
import { migrateAsyncStorageWorkoutData } from './migrations/migrateAsyncStorageWorkoutData';
import { migrateWorkoutExerciseDefinitionsWithRepository } from './migrations/migrateWorkoutExerciseDefinitions';
import { seedSystemExerciseDefinitionsOnce } from './migrations/seedSystemExerciseDefinitions';

let databaseInitializationPromise: Promise<void> | null = null;

export const initializeDatabase = async (): Promise<void> => {
    databaseInitializationPromise ??= (async () => {
        await migrate(db, migrations);
        await seedSystemExerciseDefinitionsOnce(
            dbServices.exerciseDefinitionService
        );
        migrateWorkoutExerciseDefinitionsWithRepository(
            db,
            dbServices.exerciseDefinitionService
        );
        await migrateAsyncStorageWorkoutData();
    })().catch((error) => {
        databaseInitializationPromise = null;
        throw error;
    });

    return databaseInitializationPromise;
};
