import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../../drizzle/migrations';
import { db } from './client';
import { dbServices } from './dbServices';
import { migrateAsyncStorageWorkoutData } from './migrations/migrateAsyncStorageWorkoutData/migrateAsyncStorageWorkoutData';
import { seedSystemExerciseDefinitionsOnce } from './migrations/seedSystemExerciseDefinitions';

let databaseInitializationPromise: Promise<void> | null = null;

export const initializeDatabase = async (): Promise<void> => {
    databaseInitializationPromise ??= (async () => {
        await migrate(db, migrations);
        await seedSystemExerciseDefinitionsOnce(
            dbServices.exerciseDefinitionService
        );
        await migrateAsyncStorageWorkoutData();
    })().catch((error) => {
        databaseInitializationPromise = null;
        throw error;
    });

    return databaseInitializationPromise;
};
