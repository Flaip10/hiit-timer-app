import { desc, eq, inArray } from 'drizzle-orm';

import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';

import { workoutSessionsTable } from '../../schema';
import {
    workoutSessionToDbRow,
    type WorkoutSessionRow,
} from '../../mappers/workoutSessionMapper';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';

export interface PersistedWorkoutSession extends WorkoutSession {
    workoutVersionId: string;
}

export interface RelinkWorkoutToSessionsInput {
    workoutId: string;
    workoutVersionId: string;
}

export interface WorkoutSessionRepository {
    getAllRows: () => WorkoutSessionRow[];
    getRecentRows: (limit: number) => WorkoutSessionRow[];
    getRowById: (id: string) => WorkoutSessionRow | null;
    hasSessionForVersion: (versionId: string) => boolean;
    readExistingIds: (ids: string[]) => Set<string>;
    readUsedVersionIds: (versionIds: string[]) => Set<string>;
    insertSession: (session: PersistedWorkoutSession) => void;
    relinkWorkoutToSessions: (args: RelinkWorkoutToSessionsInput) => void;
    clearSessions: () => void;
    deleteSession: (id: string) => void;
}

export interface CreateWorkoutSessionRepositoryArgs {
    db: RepositoryDb;
}

const normalizeLimit = (limit: number): number =>
    Number.isInteger(limit) && limit > 0 ? limit : 5;

export const createWorkoutSessionRepository = (
    factoryArgs: CreateWorkoutSessionRepositoryArgs,
): WorkoutSessionRepository => {
    const repositoryDb = factoryArgs.db;

    return {
        getAllRows: (): WorkoutSessionRow[] =>
            repositoryDb
                .select()
                .from(workoutSessionsTable)
                .orderBy(desc(workoutSessionsTable.endedAtMs))
                .all(),

        getRecentRows: (limit: number): WorkoutSessionRow[] =>
            repositoryDb
                .select()
                .from(workoutSessionsTable)
                .orderBy(desc(workoutSessionsTable.endedAtMs))
                .limit(normalizeLimit(limit))
                .all(),

        getRowById: (id: string): WorkoutSessionRow | null => {
            const row = repositoryDb
                .select()
                .from(workoutSessionsTable)
                .where(eq(workoutSessionsTable.id, id))
                .get();

            return row ?? null;
        },

        hasSessionForVersion: (versionId: string): boolean => {
            const session = repositoryDb
                .select({ id: workoutSessionsTable.id })
                .from(workoutSessionsTable)
                .where(eq(workoutSessionsTable.workoutVersionId, versionId))
                .get();

            return session !== undefined;
        },

        readExistingIds: (ids: string[]): Set<string> => {
            if (ids.length === 0) return new Set<string>();

            const rows = repositoryDb
                .select({ id: workoutSessionsTable.id })
                .from(workoutSessionsTable)
                .where(inArray(workoutSessionsTable.id, ids))
                .all();

            return new Set(rows.map((row) => row.id));
        },

        readUsedVersionIds: (versionIds: string[]): Set<string> => {
            if (versionIds.length === 0) return new Set<string>();

            const rows = repositoryDb
                .select({
                    workoutVersionId: workoutSessionsTable.workoutVersionId,
                })
                .from(workoutSessionsTable)
                .where(
                    inArray(workoutSessionsTable.workoutVersionId, versionIds),
                )
                .all();

            return new Set(rows.map((row) => row.workoutVersionId));
        },

        insertSession: (session: PersistedWorkoutSession): void => {
            const row = workoutSessionToDbRow(session);

            repositoryDb.insert(workoutSessionsTable).values(row).run();
        },

        relinkWorkoutToSessions: (
            relinkArgs: RelinkWorkoutToSessionsInput,
        ): void => {
            repositoryDb
                .update(workoutSessionsTable)
                .set({ workoutId: relinkArgs.workoutId })
                .where(
                    eq(
                        workoutSessionsTable.workoutVersionId,
                        relinkArgs.workoutVersionId,
                    ),
                )
                .run();
        },

        clearSessions: (): void => {
            repositoryDb.delete(workoutSessionsTable).run();
        },

        deleteSession: (id: string): void => {
            repositoryDb
                .delete(workoutSessionsTable)
                .where(eq(workoutSessionsTable.id, id))
                .run();
        },
    };
};
