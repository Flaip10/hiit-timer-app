import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import {
    createDbServices,
    type DbServices,
} from '@src/db/createDbServices';
import * as schema from '@src/db/schema';
import { systemClock, type Clock } from '@src/db/repositories/repositoryClock';
import type { RepositoryDb } from '@src/db/repositories/workouts/workoutRepositoryFactory';

export interface TestDb {
    close: () => void;
    db: RepositoryDb;
    dbServices: DbServices;
    sqliteDb: Database.Database;
}

export const createTestDb = (clock: Clock = systemClock): TestDb => {
    const sqliteDb = new Database(':memory:');
    sqliteDb.pragma('foreign_keys = ON');

    const db = drizzle(sqliteDb, { schema });
    migrate(db, { migrationsFolder: './drizzle' });
    const dbServices = createDbServices({ clock, db });
    dbServices.exerciseDefinitionService.seedSystemDefinitions();

    return {
        close: () => {
            sqliteDb.close();
        },
        db,
        dbServices,
        sqliteDb,
    };
};
