import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../../drizzle/migrations';
import { db } from './client';
import { migrateAsyncStorageWorkoutData } from './migrations/migrateAsyncStorageWorkoutData';

let databaseInitializationPromise: Promise<void> | null = null;

export const initializeDatabase = async (): Promise<void> => {
    databaseInitializationPromise ??= (async () => {
        await migrate(db, migrations);
        await migrateAsyncStorageWorkoutData();
    })().catch((error) => {
        databaseInitializationPromise = null;
        throw error;
    });

    return databaseInitializationPromise;
};
