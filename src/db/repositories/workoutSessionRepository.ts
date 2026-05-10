import { asc, eq, inArray } from 'drizzle-orm';

import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';

import { db } from '../client';
import { workoutSessionsTable } from '../schema';
import {
    workoutSessionFromDbRow,
    workoutSessionToDbRow,
} from '../mappers/workoutSessionMapper';

export const workoutSessionRepository = {
    getAll: (): WorkoutSession[] => {
        const rows = db
            .select()
            .from(workoutSessionsTable)
            .orderBy(asc(workoutSessionsTable.sortIndex))
            .all();

        return rows.map(workoutSessionFromDbRow);
    },

    getById: (id: string): WorkoutSession | null => {
        const row = db
            .select()
            .from(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, id))
            .get();

        return row ? workoutSessionFromDbRow(row) : null;
    },

    upsert: (session: WorkoutSession, sortIndex: number): void => {
        const row = workoutSessionToDbRow(session, sortIndex);

        db.insert(workoutSessionsTable)
            .values(row)
            .onConflictDoUpdate({
                target: workoutSessionsTable.id,
                set: row,
            })
            .run();
    },

    remove: (id: string): void => {
        db.delete(workoutSessionsTable)
            .where(eq(workoutSessionsTable.id, id))
            .run();
    },

    clear: (): void => {
        db.delete(workoutSessionsTable).run();
    },

    readExistingIds: (ids: string[]): Set<string> => {
        if (ids.length === 0) return new Set<string>();

        const rows = db
            .select({ id: workoutSessionsTable.id })
            .from(workoutSessionsTable)
            .where(inArray(workoutSessionsTable.id, ids))
            .all();

        return new Set(rows.map((row) => row.id));
    },
};
