import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

import * as schema from './schema';

const sqlite = openDatabaseSync('arc-timer.db');

export const db = drizzle(sqlite, { schema });
