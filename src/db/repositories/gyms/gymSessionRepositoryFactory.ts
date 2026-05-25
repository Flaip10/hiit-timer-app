import { desc, eq, ne } from 'drizzle-orm';

import { gymSessionsTable } from '../../schema';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';

export type GymSessionRow = typeof gymSessionsTable.$inferSelect;
type GymSessionInsert = typeof gymSessionsTable.$inferInsert;

export interface InsertGymSessionInput extends GymSessionInsert {}

export interface UpdateGymSessionInput
    extends Pick<GymSessionRow, 'id' | 'updatedAtMs'>,
        Partial<
            Pick<
                GymSessionRow,
                'endedAtMs' | 'notes' | 'sourceGymPlanId' | 'status'
            >
        > {}

export interface GymSessionRepository {
    getActive: () => GymSessionRow | null;
    getById: (id: string) => GymSessionRow | null;
    getRecent: (limit: number) => GymSessionRow[];
    hasActive: () => boolean;
    hasSession: (id: string) => boolean;
    insert: (input: InsertGymSessionInput) => void;
    update: (input: UpdateGymSessionInput) => void;
    delete: (id: string) => void;
}

export interface CreateGymSessionRepositoryArgs {
    db: RepositoryDb;
}

const gymSessionStatuses: GymSessionRow['status'][] = [
    'active',
    'completed',
    'discarded',
];

const assertNonEmptyId = (id: string, fieldName: string): void => {
    if (id.trim().length === 0) {
        throw new Error(`${fieldName} cannot be blank`);
    }
};

const assertFiniteTimestamp = (value: number, fieldName: string): void => {
    if (!Number.isFinite(value)) {
        throw new Error(`${fieldName} must be finite`);
    }
};

const assertNullableFiniteTimestamp = (
    value: number | null | undefined,
    fieldName: string,
): void => {
    if (value !== undefined && value !== null) {
        assertFiniteTimestamp(value, fieldName);
    }
};

const assertValidStatus = (status: GymSessionRow['status']): void => {
    if (!gymSessionStatuses.includes(status)) {
        throw new Error(`Invalid gym session status ${status}`);
    }
};

const normalizeLimit = (limit: number): number =>
    Number.isInteger(limit) && limit > 0 ? limit : 10;

export const createGymSessionRepository = ({
    db,
}: CreateGymSessionRepositoryArgs): GymSessionRepository => ({
    getActive: (): GymSessionRow | null => {
        const row = db
            .select()
            .from(gymSessionsTable)
            .where(eq(gymSessionsTable.status, 'active'))
            .get();

        return row ?? null;
    },

    getById: (id: string): GymSessionRow | null => {
        assertNonEmptyId(id, 'Gym session ID');

        const row = db
            .select()
            .from(gymSessionsTable)
            .where(eq(gymSessionsTable.id, id))
            .get();

        return row ?? null;
    },

    getRecent: (limit: number): GymSessionRow[] =>
        db
            .select()
            .from(gymSessionsTable)
            .where(ne(gymSessionsTable.status, 'active'))
            .orderBy(desc(gymSessionsTable.startedAtMs))
            .limit(normalizeLimit(limit))
            .all(),

    hasActive: (): boolean => {
        const session = db
            .select({ id: gymSessionsTable.id })
            .from(gymSessionsTable)
            .where(eq(gymSessionsTable.status, 'active'))
            .limit(1)
            .get();

        return session !== undefined;
    },

    hasSession: (id: string): boolean => {
        assertNonEmptyId(id, 'Gym session ID');

        const session = db
            .select({ id: gymSessionsTable.id })
            .from(gymSessionsTable)
            .where(eq(gymSessionsTable.id, id))
            .limit(1)
            .get();

        return session !== undefined;
    },

    insert: (input: InsertGymSessionInput): void => {
        assertNonEmptyId(input.id, 'Gym session ID');
        assertFiniteTimestamp(input.startedAtMs, 'startedAtMs');
        assertNullableFiniteTimestamp(input.endedAtMs, 'endedAtMs');
        assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
        assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
        assertValidStatus(input.status);

        db.insert(gymSessionsTable)
            .values({
                createdAtMs: input.createdAtMs,
                endedAtMs: input.endedAtMs ?? null,
                id: input.id,
                notes: input.notes ?? null,
                sourceGymPlanId: input.sourceGymPlanId ?? null,
                startedAtMs: input.startedAtMs,
                status: input.status,
                updatedAtMs: input.updatedAtMs,
            })
            .run();
    },

    update: (input: UpdateGymSessionInput): void => {
        assertNonEmptyId(input.id, 'Gym session ID');
        assertNullableFiniteTimestamp(input.endedAtMs, 'endedAtMs');
        assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
        if (input.status !== undefined) {
            assertValidStatus(input.status);
        }

        db.update(gymSessionsTable)
            .set({
                endedAtMs: input.endedAtMs,
                notes: input.notes,
                sourceGymPlanId: input.sourceGymPlanId,
                status: input.status,
                updatedAtMs: input.updatedAtMs,
            })
            .where(eq(gymSessionsTable.id, input.id))
            .run();
    },

    delete: (id: string): void => {
        assertNonEmptyId(id, 'Gym session ID');

        db.delete(gymSessionsTable)
            .where(eq(gymSessionsTable.id, id))
            .run();
    },
});
