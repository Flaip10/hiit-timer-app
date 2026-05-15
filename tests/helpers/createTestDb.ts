import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as schema from '@src/db/schema';
import type { RepositoryDb } from '@src/db/repositories/workoutRepositoryFactory';

export interface TestDb {
    close: () => void;
    db: RepositoryDb;
    sqliteDb: Database.Database;
}

export const createTestDb = (): TestDb => {
    const sqliteDb = new Database(':memory:');
    sqliteDb.pragma('foreign_keys = ON');

    const db = drizzle(sqliteDb, { schema });
    migrate(db, { migrationsFolder: './drizzle' });

    return {
        close: () => {
            sqliteDb.close();
        },
        db,
        sqliteDb,
    };
};
