import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '@src/core/entities/entities';
import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';

import {
    isRecord,
    isStringList,
    isWorkout,
    isWorkoutSession,
} from '../mappers/jsonGuards';
import { workoutRepository } from '../repositories/workoutRepository';
import { workoutSessionRepository } from '../repositories/workoutSessionRepository';

const WORKOUTS_STORAGE_KEY = 'workouts-storage';
const WORKOUT_HISTORY_STORAGE_KEY = 'workout-history-storage-v1';
const SQLITE_WORKOUT_MIGRATION_KEY = 'sqlite-workout-migration-v1';

interface PersistedWorkoutsState {
    workouts: Record<string, Workout>;
    order: string[];
}

interface PersistedWorkoutHistoryState {
    sessions: Record<string, WorkoutSession>;
    order: string[];
}

interface MigrationCounts {
    workouts: number;
    sessions: number;
}

export interface AsyncStorageWorkoutMigrationResult {
    didRun: boolean;
    counts: MigrationCounts;
}

const readPersistedState = (raw: string | null): unknown | null => {
    if (raw == null) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;

    return parsed.state ?? null;
};

const readPersistedWorkouts = (raw: string | null): PersistedWorkoutsState => {
    const state = readPersistedState(raw);
    if (!isRecord(state)) return { workouts: {}, order: [] };

    const workouts: Record<string, Workout> = {};
    const sourceWorkouts = isRecord(state.workouts) ? state.workouts : {};

    Object.entries(sourceWorkouts).forEach(([id, workout]) => {
        if (isWorkout(workout) && workout.id === id) {
            workouts[id] = workout;
        }
    });

    return {
        workouts,
        order: isStringList(state.order) ? state.order : [],
    };
};

const readPersistedWorkoutHistory = (
    raw: string | null
): PersistedWorkoutHistoryState => {
    const state = readPersistedState(raw);
    if (!isRecord(state)) return { sessions: {}, order: [] };

    const sessions: Record<string, WorkoutSession> = {};
    const sourceSessions = isRecord(state.sessions) ? state.sessions : {};

    Object.entries(sourceSessions).forEach(([id, session]) => {
        if (isWorkoutSession(session) && session.id === id) {
            sessions[id] = session;
        }
    });

    return {
        sessions,
        order: isStringList(state.order) ? state.order : [],
    };
};

const getOrderedIds = <
    TItem extends { updatedAtMs?: number; startedAtMs?: number },
>(
    items: Record<string, TItem>,
    persistedOrder: string[]
): string[] => {
    const seen = new Set<string>();
    const orderedIds = persistedOrder.filter((id) => {
        if (seen.has(id) || !(id in items)) return false;
        seen.add(id);
        return true;
    });

    const missingIds = Object.keys(items)
        .filter((id) => !seen.has(id))
        .sort((leftId, rightId) => {
            const left = items[leftId];
            const right = items[rightId];
            const leftMs = left.updatedAtMs ?? left.startedAtMs ?? 0;
            const rightMs = right.updatedAtMs ?? right.startedAtMs ?? 0;

            return rightMs - leftMs;
        });

    return [...orderedIds, ...missingIds];
};

const assertAllIdsWereCopied = (args: {
    label: string;
    expectedIds: string[];
    actualIds: Set<string>;
}): void => {
    const missingIds = args.expectedIds.filter((id) => !args.actualIds.has(id));
    if (missingIds.length > 0) {
        throw new Error(
            `${args.label} migration verification failed for ${missingIds.length} ids`
        );
    }
};

const writeMigrationMarker = async (counts: MigrationCounts): Promise<void> => {
    await AsyncStorage.setItem(
        SQLITE_WORKOUT_MIGRATION_KEY,
        JSON.stringify({
            migratedAtMs: Date.now(),
            counts,
        })
    );
};

export const migrateAsyncStorageWorkoutData =
    async (): Promise<AsyncStorageWorkoutMigrationResult> => {
        const [workoutsRaw, historyRaw, existingMarker] = await Promise.all([
            AsyncStorage.getItem(WORKOUTS_STORAGE_KEY),
            AsyncStorage.getItem(WORKOUT_HISTORY_STORAGE_KEY),
            AsyncStorage.getItem(SQLITE_WORKOUT_MIGRATION_KEY),
        ]);

        if (existingMarker != null) {
            return {
                didRun: false,
                counts: { workouts: 0, sessions: 0 },
            };
        }

        const persistedWorkouts = readPersistedWorkouts(workoutsRaw);
        const persistedHistory = readPersistedWorkoutHistory(historyRaw);

        const workoutIds = getOrderedIds(
            persistedWorkouts.workouts,
            persistedWorkouts.order
        );
        const sessionIds = getOrderedIds(
            persistedHistory.sessions,
            persistedHistory.order
        );

        workoutIds.forEach((id, index) => {
            workoutRepository.upsert(persistedWorkouts.workouts[id], index);
        });

        sessionIds.forEach((id, index) => {
            workoutSessionRepository.upsert(persistedHistory.sessions[id], index);
        });

        assertAllIdsWereCopied({
            label: 'Workout',
            expectedIds: workoutIds,
            actualIds: workoutRepository.readExistingIds(workoutIds),
        });
        assertAllIdsWereCopied({
            label: 'Workout session',
            expectedIds: sessionIds,
            actualIds: workoutSessionRepository.readExistingIds(sessionIds),
        });

        const counts = {
            workouts: workoutIds.length,
            sessions: sessionIds.length,
        };

        await writeMigrationMarker(counts);

        return {
            didRun: true,
            counts,
        };
    };
