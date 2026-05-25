import type {
    GymExerciseRecord,
    GymExerciseRecordSet,
    GymSession,
} from '@src/core/entities/gym.interfaces';
import { uid } from '@src/core/id';

import { createGymError, gymErrors } from '../../repositories/gyms/gymErrors';
import type {
    GymExerciseRecordRepository,
    PersistedGymExerciseRecord,
    PersistedGymExerciseRecordSet,
} from '../../repositories/gyms/gymExerciseRecordRepositoryFactory';
import type {
    GymSessionRepository,
    GymSessionRow,
} from '../../repositories/gyms/gymSessionRepositoryFactory';
import { systemClock, type Clock } from '../../repositories/repositoryClock';
import type { ExerciseDefinitionService } from '../exerciseDefinitions/exerciseDefinitionServiceFactory';

export interface ListGymSessionsInput {
    limit?: number;
}

export interface StartEmptyGymSessionInput {
    notes?: string;
    startedAtMs?: number;
}

export interface AddExerciseRecordToSessionInput {
    exerciseDefinitionId: string;
    notes?: string;
    sessionId: string;
    startedAtMs?: number;
}

export interface UpdateExerciseRecordInput {
    completedAtMs?: number;
    id: string;
    notes?: string;
    sortIndex?: number;
    startedAtMs?: number;
}

export interface AddSetToExerciseRecordInput {
    completedAtMs?: number;
    distanceMeters?: number;
    durationSec?: number;
    exerciseRecordId: string;
    isWarmup?: boolean;
    notes?: string;
    reps?: number;
    rpeTenths?: number;
    weightGrams?: number;
}

export interface UpdateExerciseRecordSetInput {
    completedAtMs?: number;
    distanceMeters?: number;
    durationSec?: number;
    id: string;
    isWarmup?: boolean;
    notes?: string;
    reps?: number;
    rpeTenths?: number;
    setIndex?: number;
    weightGrams?: number;
}

export interface FinishGymSessionInput {
    endedAtMs?: number;
    notes?: string;
    sessionId?: string;
}

export interface GymSessionService {
    getActiveGymSession: () => GymSession | null;
    getGymSessionById: (id: string) => GymSession | null;
    listGymSessions: (input?: ListGymSessionsInput) => GymSession[];
    startEmptyGymSession: (input?: StartEmptyGymSessionInput) => GymSession;
    addExerciseRecordToSession: (
        input: AddExerciseRecordToSessionInput,
    ) => GymExerciseRecord;
    addSetToExerciseRecord: (
        input: AddSetToExerciseRecordInput,
    ) => GymExerciseRecordSet;
    updateExerciseRecord: (
        input: UpdateExerciseRecordInput,
    ) => GymExerciseRecord;
    updateExerciseRecordSet: (
        input: UpdateExerciseRecordSetInput,
    ) => GymExerciseRecordSet;
    finishGymSession: (input?: FinishGymSessionInput) => GymSession;
    discardGymSession: (id: string) => GymSession;
    deleteExerciseRecord: (id: string) => void;
    deleteExerciseRecordSet: (id: string) => void;
}

export interface CreateGymSessionServiceArgs {
    clock?: Clock;
    exerciseDefinitionService: ExerciseDefinitionService;
    gymExerciseRecordRepository: GymExerciseRecordRepository;
    gymSessionRepository: GymSessionRepository;
}

const DEFAULT_RECENT_SESSION_LIMIT = 10;

const gymExerciseRecordSetFromPersisted = (
    set: PersistedGymExerciseRecordSet,
): GymExerciseRecordSet => ({
    id: set.id,
    setIndex: set.setIndex,
    reps: set.reps,
    weightGrams: set.weightGrams,
    durationSec: set.durationSec,
    distanceMeters: set.distanceMeters,
    rpeTenths: set.rpeTenths,
    isWarmup: set.isWarmup,
    completedAtMs: set.completedAtMs,
    notes: set.notes,
    createdAtMs: set.createdAtMs,
    updatedAtMs: set.updatedAtMs,
});

const gymExerciseRecordFromPersisted = (
    record: PersistedGymExerciseRecord,
): GymExerciseRecord => ({
    id: record.id,
    exerciseDefinitionId: record.exerciseDefinitionId,
    sourceGymPlanExerciseId: record.sourceGymPlanExerciseId,
    sortIndex: record.sortIndex,
    startedAtMs: record.startedAtMs,
    completedAtMs: record.completedAtMs,
    notes: record.notes,
    sets: record.sets.map(gymExerciseRecordSetFromPersisted),
    createdAtMs: record.createdAtMs,
    updatedAtMs: record.updatedAtMs,
});

const gymSessionFromRow = (
    row: GymSessionRow,
    records: PersistedGymExerciseRecord[],
): GymSession => ({
    id: row.id,
    startedAtMs: row.startedAtMs,
    endedAtMs: row.endedAtMs ?? undefined,
    status: row.status,
    sourceGymPlanId: row.sourceGymPlanId ?? undefined,
    notes: row.notes ?? undefined,
    exerciseRecords: records.map(gymExerciseRecordFromPersisted),
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

const hasMeaningfulSetValue = (
    set: Pick<
        GymExerciseRecordSet,
        'distanceMeters' | 'durationSec' | 'reps' | 'weightGrams'
    >,
): boolean =>
    set.reps !== undefined ||
    set.weightGrams !== undefined ||
    set.durationSec !== undefined ||
    set.distanceMeters !== undefined;

export const createGymSessionService = ({
    clock = systemClock,
    exerciseDefinitionService,
    gymExerciseRecordRepository,
    gymSessionRepository,
}: CreateGymSessionServiceArgs): GymSessionService => {
    const hydrateSessionRow = (row: GymSessionRow): GymSession =>
        gymSessionFromRow(
            row,
            gymExerciseRecordRepository.getBySessionId(row.id),
        );

    const getSessionOrThrow = (id: string): GymSessionRow => {
        const session = gymSessionRepository.getById(id);
        if (!session) {
            throw createGymError(gymErrors.sessionNotFound);
        }

        return session;
    };

    const getActiveSessionOrThrow = (id?: string): GymSessionRow => {
        const session = id
            ? gymSessionRepository.getById(id)
            : gymSessionRepository.getActive();
        if (!session) {
            if (id) {
                throw createGymError(gymErrors.sessionNotFound);
            }

            throw createGymError(gymErrors.activeSessionNotFound);
        }

        if (session.status !== 'active') {
            throw createGymError(gymErrors.sessionNotMutable);
        }

        return session;
    };

    const getRecordInActiveSessionOrThrow = (
        recordId: string,
    ): PersistedGymExerciseRecord => {
        const record = gymExerciseRecordRepository.getById(recordId);
        if (!record) {
            throw createGymError(gymErrors.exerciseRecordNotFound);
        }

        const session = gymSessionRepository.getById(record.gymSessionId);
        if (session?.status !== 'active') {
            throw createGymError(gymErrors.exerciseRecordNotInActiveSession);
        }

        return record;
    };

    const getSetInActiveSessionOrThrow = (
        setId: string,
    ): PersistedGymExerciseRecordSet => {
        const set = gymExerciseRecordRepository.getSetById(setId);
        if (!set) {
            throw createGymError(gymErrors.exerciseSetNotFound);
        }

        getRecordInActiveSessionOrThrow(set.gymExerciseRecordId);

        return set;
    };

    const assertExerciseDefinitionCanBeUsed = (
        exerciseDefinitionId: string,
    ): void => {
        const definition = exerciseDefinitionService.getById(exerciseDefinitionId);
        if (!definition) {
            throw createGymError(gymErrors.exerciseDefinitionNotFound);
        }

        if (definition.availability === 'workout') {
            throw createGymError(gymErrors.exerciseDefinitionNotGymAvailable);
        }
    };

    const assertSetIsMeaningful = (
        set: Pick<
            GymExerciseRecordSet,
            'distanceMeters' | 'durationSec' | 'reps' | 'weightGrams'
        >,
    ): void => {
        if (!hasMeaningfulSetValue(set)) {
            throw createGymError(gymErrors.invalidGymSet);
        }
    };

    const assertRecordTimeRange = (
        startedAtMs: number | undefined,
        completedAtMs: number | undefined,
    ): void => {
        if (
            startedAtMs !== undefined &&
            completedAtMs !== undefined &&
            completedAtMs < startedAtMs
        ) {
            throw createGymError(gymErrors.invalidGymExerciseRecordTimeRange);
        }
    };

    const service: GymSessionService = {
        getActiveGymSession: (): GymSession | null => {
            const session = gymSessionRepository.getActive();
            return session ? hydrateSessionRow(session) : null;
        },

        getGymSessionById: (id: string): GymSession | null => {
            const session = gymSessionRepository.getById(id);
            return session ? hydrateSessionRow(session) : null;
        },

        listGymSessions: ({
            limit = DEFAULT_RECENT_SESSION_LIMIT,
        }: ListGymSessionsInput = {}): GymSession[] =>
            gymSessionRepository
                .getRecent(limit)
                .map((session) => hydrateSessionRow(session)),

        startEmptyGymSession: (
            input: StartEmptyGymSessionInput = {},
        ): GymSession => {
            if (gymSessionRepository.hasActive()) {
                throw createGymError(gymErrors.activeSessionExists);
            }

            const nowMs = clock.now();
            const startedAtMs = input.startedAtMs ?? nowMs;
            const id = uid();
            gymSessionRepository.insert({
                id,
                startedAtMs,
                status: 'active',
                notes: input.notes,
                createdAtMs: nowMs,
                updatedAtMs: nowMs,
            });

            return hydrateSessionRow(getSessionOrThrow(id));
        },

        addExerciseRecordToSession: ({
            exerciseDefinitionId,
            notes,
            sessionId,
            startedAtMs,
        }: AddExerciseRecordToSessionInput): GymExerciseRecord => {
            const session = getActiveSessionOrThrow(sessionId);
            assertExerciseDefinitionCanBeUsed(exerciseDefinitionId);

            const nowMs = clock.now();
            const id = uid();
            gymExerciseRecordRepository.insertRecord({
                id,
                gymSessionId: session.id,
                exerciseDefinitionId,
                sortIndex:
                    gymExerciseRecordRepository.getNextRecordSortIndex(
                        session.id,
                    ),
                startedAtMs,
                notes,
                createdAtMs: nowMs,
                updatedAtMs: nowMs,
            });

            const record = gymExerciseRecordRepository.getById(id);
            if (!record) {
                throw createGymError(gymErrors.exerciseRecordNotFound);
            }

            return gymExerciseRecordFromPersisted(record);
        },

        addSetToExerciseRecord: ({
            completedAtMs,
            distanceMeters,
            durationSec,
            exerciseRecordId,
            isWarmup = false,
            notes,
            reps,
            rpeTenths,
            weightGrams,
        }: AddSetToExerciseRecordInput): GymExerciseRecordSet => {
            getRecordInActiveSessionOrThrow(exerciseRecordId);
            assertSetIsMeaningful({
                distanceMeters,
                durationSec,
                reps,
                weightGrams,
            });

            const nowMs = clock.now();
            const id = uid();
            gymExerciseRecordRepository.insertSet({
                id,
                gymExerciseRecordId: exerciseRecordId,
                setIndex:
                    gymExerciseRecordRepository.getNextSetIndex(
                        exerciseRecordId,
                    ),
                reps,
                weightGrams,
                durationSec,
                distanceMeters,
                rpeTenths,
                isWarmup,
                completedAtMs,
                notes,
                createdAtMs: nowMs,
                updatedAtMs: nowMs,
            });

            const set = gymExerciseRecordRepository.getSetById(id);
            if (!set) {
                throw createGymError(gymErrors.exerciseSetNotFound);
            }

            return gymExerciseRecordSetFromPersisted(set);
        },

        updateExerciseRecord: ({
            completedAtMs,
            id,
            notes,
            sortIndex,
            startedAtMs,
        }: UpdateExerciseRecordInput): GymExerciseRecord => {
            const existing = getRecordInActiveSessionOrThrow(id);
            assertRecordTimeRange(
                startedAtMs ?? existing.startedAtMs,
                completedAtMs ?? existing.completedAtMs,
            );

            gymExerciseRecordRepository.updateRecord({
                id,
                completedAtMs,
                notes,
                sortIndex,
                startedAtMs,
                updatedAtMs: clock.now(),
            });

            const updated = gymExerciseRecordRepository.getById(id);
            if (!updated) {
                throw createGymError(gymErrors.exerciseRecordNotFound);
            }

            return gymExerciseRecordFromPersisted(updated);
        },

        updateExerciseRecordSet: ({
            completedAtMs,
            distanceMeters,
            durationSec,
            id,
            isWarmup,
            notes,
            reps,
            rpeTenths,
            setIndex,
            weightGrams,
        }: UpdateExerciseRecordSetInput): GymExerciseRecordSet => {
            const existing = getSetInActiveSessionOrThrow(id);
            assertSetIsMeaningful({
                distanceMeters: distanceMeters ?? existing.distanceMeters,
                durationSec: durationSec ?? existing.durationSec,
                reps: reps ?? existing.reps,
                weightGrams: weightGrams ?? existing.weightGrams,
            });

            gymExerciseRecordRepository.updateSet({
                id,
                completedAtMs,
                distanceMeters,
                durationSec,
                isWarmup,
                notes,
                reps,
                rpeTenths,
                setIndex,
                updatedAtMs: clock.now(),
                weightGrams,
            });

            const updated = gymExerciseRecordRepository.getSetById(id);
            if (!updated) {
                throw createGymError(gymErrors.exerciseSetNotFound);
            }

            return gymExerciseRecordSetFromPersisted(updated);
        },

        finishGymSession: (
            input: FinishGymSessionInput = {},
        ): GymSession => {
            const session = getActiveSessionOrThrow(input.sessionId);
            const endedAtMs = input.endedAtMs ?? clock.now();
            if (endedAtMs < session.startedAtMs) {
                throw createGymError(gymErrors.invalidGymSessionTimeRange);
            }

            gymSessionRepository.update({
                id: session.id,
                status: 'completed',
                endedAtMs,
                notes: input.notes,
                updatedAtMs: clock.now(),
            });

            return hydrateSessionRow(getSessionOrThrow(session.id));
        },

        discardGymSession: (id: string): GymSession => {
            const session = getActiveSessionOrThrow(id);
            const nowMs = clock.now();
            if (nowMs < session.startedAtMs) {
                throw createGymError(gymErrors.invalidGymSessionTimeRange);
            }

            gymSessionRepository.update({
                id: session.id,
                status: 'discarded',
                endedAtMs: nowMs,
                updatedAtMs: nowMs,
            });

            return hydrateSessionRow(getSessionOrThrow(session.id));
        },

        deleteExerciseRecord: (id: string): void => {
            getRecordInActiveSessionOrThrow(id);
            gymExerciseRecordRepository.deleteRecord(id);
        },

        deleteExerciseRecordSet: (id: string): void => {
            getSetInActiveSessionOrThrow(id);
            gymExerciseRecordRepository.deleteSet(id);
        },
    };

    return service;
};
