import type { Workout } from '@src/core/entities/entities';
import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';
import type { WorkoutSessionStats } from '@src/core/entities/workoutSession.interfaces';
import { uid } from '@src/core/id';

import {
    workoutSessionFromDbRow,
    type WorkoutSessionRow,
} from '../../mappers/workoutSessionMapper';
import { hasSameWorkoutContent } from '../../mappers/workouts/workoutContent';
import type { ExerciseDefinitionService } from '../exerciseDefinitions/exerciseDefinitionServiceFactory';
import type {
    PersistedWorkoutSession,
    WorkoutSessionRepository,
} from '../../repositories/workoutSessions/workoutSessionRepositoryFactory';
import type { WorkoutRepository } from '../../repositories/workouts/workoutRepositoryFactory';

export interface CreateWorkoutSessionArgs {
    workout: Workout;
    sourceWorkoutVersionId?: string;
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}

export interface WorkoutSessionService {
    getAll: () => WorkoutSession[];
    getById: (id: string) => WorkoutSession | null;
    getRecent: (limit: number) => WorkoutSession[];
    createSession: (args: CreateWorkoutSessionArgs) => WorkoutSession;
    clearSessions: () => void;
    deleteSession: (id: string) => void;
}

export interface CreateWorkoutSessionServiceArgs {
    exerciseDefinitionService: ExerciseDefinitionService;
    workoutRepository: WorkoutRepository;
    workoutSessionRepository: WorkoutSessionRepository;
}

const resolveSessionDurationSec = (args: {
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}): number => {
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

    const resolveWorkoutVersionId = (session: WorkoutSession): string => {
        if (session.workoutVersionId && session.workoutVersionId.length > 0) {
            return session.workoutVersionId;
        }

        return workoutRepository.createWorkoutVersion(
            session.workoutSnapshot,
        );
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
                throw new Error(`Missing workout content for session ${row.id}`);
            }

            return workoutSessionFromDbRow(
                row,
                versionWorkout,
                activeWorkoutIdsByVersionId.get(row.workoutVersionId),
            );
        });
    };

    const buildWorkoutSession = (
        buildArgs: CreateWorkoutSessionArgs,
    ): WorkoutSession => {
        const endedAtMs = Math.max(buildArgs.endedAtMs, buildArgs.startedAtMs);
        const workoutSnapshot =
            exerciseDefinitionService.resolveWorkoutExerciseDefinitions({
                ...buildArgs.workout,
                updatedAtMs: Number.isFinite(buildArgs.workout.updatedAtMs)
                    ? buildArgs.workout.updatedAtMs
                    : endedAtMs,
            });
        const sourceVersionWorkout = buildArgs.sourceWorkoutVersionId
            ? workoutRepository.getWorkoutByVersionId(
                  buildArgs.sourceWorkoutVersionId
              )
            : null;
        const workoutVersionId =
            sourceVersionWorkout !== null &&
            hasSameWorkoutContent(sourceVersionWorkout, workoutSnapshot)
                ? buildArgs.sourceWorkoutVersionId
                : undefined;
        const currentWorkoutVersionId = workoutRepository.getCurrentVersionId(
            buildArgs.workout.id
        );
        const currentVersionWorkout = currentWorkoutVersionId
            ? workoutRepository.getWorkoutByVersionId(currentWorkoutVersionId)
            : null;
        const nextWorkoutVersionId =
            workoutVersionId ??
            (currentWorkoutVersionId !== null &&
            currentVersionWorkout !== null &&
            hasSameWorkoutContent(currentVersionWorkout, workoutSnapshot)
                ? currentWorkoutVersionId
                : undefined);

        return {
            id: uid(),
            startedAtMs: buildArgs.startedAtMs,
            endedAtMs,
            workoutSnapshot,
            workoutVersionId: nextWorkoutVersionId,
            workoutNameSnapshot: workoutSnapshot.name,
            totalDurationSec: resolveSessionDurationSec({
                startedAtMs: buildArgs.startedAtMs,
                endedAtMs,
                stats: buildArgs.stats,
            }),
            stats: buildArgs.stats,
        };
    };

    return {
        getAll: (): WorkoutSession[] =>
            hydrateSessionRows(workoutSessionRepository.getAllRows()),

        getById: (id: string): WorkoutSession | null => {
            const row = workoutSessionRepository.getRowById(id);
            if (row === null) return null;

            return hydrateSessionRows([row])[0] ?? null;
        },

        getRecent: (limit: number): WorkoutSession[] =>
            hydrateSessionRows(workoutSessionRepository.getRecentRows(limit)),

        createSession: (args: CreateWorkoutSessionArgs): WorkoutSession => {
            const session = buildWorkoutSession(args);
            const nextSession: PersistedWorkoutSession = {
                ...session,
                workoutVersionId: resolveWorkoutVersionId(session),
            };

            workoutSessionRepository.insertSession(nextSession);

            return nextSession;
        },

        clearSessions: (): void => {
            const deletedRows = workoutSessionRepository.getAllRows();

            workoutSessionRepository.clearSessions();

            const versionIds = new Set(
                deletedRows.map((row) => row.workoutVersionId)
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
};
