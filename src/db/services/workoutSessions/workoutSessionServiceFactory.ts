import type { Workout } from '@src/core/entities/entities';
import type {
    WorkoutSession,
    WorkoutSessionStats,
} from '@src/core/entities/workoutSession.interfaces';
import { uid } from '@src/core/id';

import {
    workoutSessionFromDbRow,
    type WorkoutSessionRow,
} from '../../mappers/workoutSessionMapper';
import type { ExerciseDefinitionService } from '../exerciseDefinitions/exerciseDefinitionServiceFactory';
import type { WorkoutSessionRepository } from '../../repositories/workoutSessions/workoutSessionRepositoryFactory';
import type { WorkoutRepository } from '../../repositories/workouts/workoutRepositoryFactory';

export interface CreateWorkoutSessionArgs {
    versionId: string;
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}

export interface CreateWorkoutSessionFromSnapshotArgs {
    workout: Workout;
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}

export interface WorkoutSessionService {
    getAll: () => WorkoutSession[];
    getById: (id: string) => WorkoutSession | null;
    getRecent: (limit: number) => WorkoutSession[];
    createSession: (args: CreateWorkoutSessionArgs) => WorkoutSession;
    createSessionFromSnapshot: (
        args: CreateWorkoutSessionFromSnapshotArgs,
    ) => WorkoutSession;
    clearSessions: () => void;
    deleteSession: (id: string) => void;
}

export interface CreateWorkoutSessionServiceArgs {
    exerciseDefinitionService: ExerciseDefinitionService;
    workoutRepository: WorkoutRepository;
    workoutSessionRepository: WorkoutSessionRepository;
}

interface ResolveSessionDurationSecArgs {
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}

const resolveSessionDurationSec = (args: ResolveSessionDurationSecArgs): number => {
    const { startedAtMs, endedAtMs, stats } = args;

    if (stats != null) {
        return (
            stats.totalWorkSec +
            stats.totalRestSec +
            (stats.totalPausedSec ?? 0) +
            (stats.totalBlockPauseSec ?? 0)
        );
    }

    return Math.round((endedAtMs - startedAtMs) / 1000);
};

interface BuildPersistedSessionArgs {
    versionId: string;
    workoutSnapshot: Workout;
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}

const buildPersistedSession = (args: BuildPersistedSessionArgs): WorkoutSession => {
    const endedAtMs = Math.max(args.endedAtMs, args.startedAtMs);

    return {
        id: uid(),
        startedAtMs: args.startedAtMs,
        endedAtMs,
        workoutSnapshot: args.workoutSnapshot,
        workoutVersionId: args.versionId,
        totalDurationSec: resolveSessionDurationSec({
            startedAtMs: args.startedAtMs,
            endedAtMs,
            stats: args.stats,
        }),
        stats: args.stats,
    };
};

export const createWorkoutSessionService = ({
    exerciseDefinitionService,
    workoutRepository,
    workoutSessionRepository,
}: CreateWorkoutSessionServiceArgs): WorkoutSessionService => {
    const deleteWorkoutVersionsIfOrphan = (
        versionIds: Iterable<string>,
    ): void => {
        const uniqueVersionIds = Array.from(new Set(versionIds));
        if (uniqueVersionIds.length === 0) return;

        const workoutVersionIds =
            workoutRepository.readUsedVersionIds(uniqueVersionIds);
        const sessionVersionIds =
            workoutSessionRepository.readUsedVersionIds(uniqueVersionIds);

        uniqueVersionIds.forEach((versionId) => {
            if (
                !workoutVersionIds.has(versionId) &&
                !sessionVersionIds.has(versionId)
            ) {
                workoutRepository.deleteWorkoutVersion(versionId);
            }
        });
    };

    const hydrateSessionRows = (
        rows: WorkoutSessionRow[],
    ): WorkoutSession[] => {
        if (rows.length === 0) return [];

        const versionIds = Array.from(
            new Set(rows.map((row) => row.workoutVersionId)),
        );
        const workoutsByVersionId =
            workoutRepository.getWorkoutsByVersionIds(versionIds);
        const activeWorkoutIdsByVersionId =
            workoutRepository.getActiveWorkoutIdsByVersionIds(versionIds);

        return rows.map((row) => {
            const versionWorkout = workoutsByVersionId.get(
                row.workoutVersionId,
            );
            if (!versionWorkout) {
                throw new Error(
                    `Missing workout content for session ${row.id}`,
                );
            }

            const activeWorkoutId = activeWorkoutIdsByVersionId.get(
                row.workoutVersionId,
            );

            return workoutSessionFromDbRow(
                row,
                versionWorkout,
                activeWorkoutId,
            );
        });
    };

    const service: WorkoutSessionService = {
        getAll: (): WorkoutSession[] =>
            hydrateSessionRows(workoutSessionRepository.getAllRows()),

        getById: (id: string): WorkoutSession | null => {
            const row = workoutSessionRepository.getRowById(id);
            if (row === null) return null;

            return hydrateSessionRows([row])[0] ?? null;
        },

        getRecent: (limit: number): WorkoutSession[] =>
            hydrateSessionRows(workoutSessionRepository.getRecentRows(limit)),

        createSession: ({
            versionId,
            startedAtMs,
            endedAtMs,
            stats,
        }): WorkoutSession => {
            const workoutContent =
                workoutRepository.getWorkoutByVersionId(versionId);
            if (!workoutContent) {
                throw new Error(`Workout version ${versionId} not found`);
            }

            const session = buildPersistedSession({
                versionId,
                workoutSnapshot: workoutContent,
                startedAtMs,
                endedAtMs,
                stats,
            });

            workoutSessionRepository.insertSession(session);
            return session;
        },

        createSessionFromSnapshot: ({
            workout,
            startedAtMs,
            endedAtMs,
            stats,
        }): WorkoutSession => {
            const endedAtMsResolved = Math.max(endedAtMs, startedAtMs);

            const existingVersionId = workoutRepository.getCurrentVersionId(
                workout.id,
            );
            if (existingVersionId) {
                return service.createSession({
                    versionId: existingVersionId,
                    startedAtMs,
                    endedAtMs: endedAtMsResolved,
                    stats,
                });
            }

            const workoutSnapshot =
                exerciseDefinitionService.resolveWorkoutExerciseDefinitions({
                    ...workout,
                    updatedAtMs: Number.isFinite(workout.updatedAtMs)
                        ? workout.updatedAtMs
                        : endedAtMsResolved,
                });

            const versionId =
                workoutRepository.createWorkoutVersion(workoutSnapshot);

            const session = buildPersistedSession({
                versionId,
                workoutSnapshot,
                startedAtMs,
                endedAtMs: endedAtMsResolved,
                stats,
            });

            workoutSessionRepository.insertSession(session);
            return session;
        },

        clearSessions: (): void => {
            const deletedRows = workoutSessionRepository.getAllRows();

            workoutSessionRepository.clearSessions();

            const versionIds = new Set(
                deletedRows.map((row) => row.workoutVersionId),
            );

            deleteWorkoutVersionsIfOrphan(versionIds);
        },

        deleteSession: (id: string): void => {
            const deletedRow = workoutSessionRepository.getRowById(id);

            workoutSessionRepository.deleteSession(id);

            if (deletedRow?.workoutVersionId) {
                deleteWorkoutVersionsIfOrphan([deletedRow.workoutVersionId]);
            }
        },
    };

    return service;
};
