import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../../drizzle/migrations';
import { db } from './client';

let databaseInitializationPromise: Promise<void> | null = null;

export const initializeDatabase = async (): Promise<void> => {
    databaseInitializationPromise ??= migrate(db, migrations).catch((error) => {
        databaseInitializationPromise = null;
        throw error;
    });

    return databaseInitializationPromise;
};
