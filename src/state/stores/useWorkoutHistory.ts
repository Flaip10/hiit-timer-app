import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';

import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';
import type { Workout } from '@src/core/entities/entities';
import { useShallow } from 'zustand/react/shallow';

interface WorkoutHistoryState {
    sessions: Record<string, WorkoutSession>;
    order: string[]; // newest first

    addSession: (args: {
        workoutSnapshot: Workout;
        workoutId?: string;
        startedAtMs: number;
        endedAtMs: number;
        stats?: WorkoutSession['stats'];
    }) => string;

    removeSession: (id: string) => void;
    clearAll: () => void;
}

const uid = (): string => nanoid(12);

export const useWorkoutHistory = create<WorkoutHistoryState>()(
    persist(
        immer((set, get) => ({
            sessions: {},
            order: [],

            addSession: ({
                workoutSnapshot,
                workoutId,
                startedAtMs,
                endedAtMs,
                stats,
            }) => {
                const id = uid();

                // Deep-clone snapshot so it never mutates later.
                const snap: Workout =
                    typeof structuredClone === 'function'
                        ? structuredClone(workoutSnapshot)
                        : (JSON.parse(
                              JSON.stringify(workoutSnapshot)
                          ) as Workout);

                const ended = Math.max(endedAtMs, startedAtMs);
                // Ensure snapshot has updatedAtMs (for backwards compatibility and consistency)
                if (!Number.isFinite(snap.updatedAtMs)) {
                    snap.updatedAtMs = ended;
                }
                const totalDurationSec = Math.round(
                    (ended - startedAtMs) / 1000
                );

                const session: WorkoutSession = {
                    id,
                    startedAtMs,
                    endedAtMs: ended,
                    workoutSnapshot: snap,
                    workoutId,
                    workoutNameSnapshot: snap.name,
                    totalDurationSec,
                    stats,
                };

                set((state) => {
                    state.sessions[id] = session;
                    state.order = [id, ...state.order.filter((x) => x !== id)];
                });

                return id;
            },

            removeSession: (id) =>
                set((state) => {
                    const rest = { ...state.sessions };
                    delete rest[id];
                    state.sessions = rest;
                    state.order = state.order.filter((x) => x !== id);
                }),

            clearAll: () =>
                set((state) => {
                    state.sessions = {};
                    state.order = [];
                }),
        })),
        {
            name: 'workout-history-storage-v1',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                sessions: state.sessions,
                order: state.order,
            }),
        }
    )
);

// ---- selector cache ------------------------------------------------

const recentSelectorCache = new Map<
    number,
    (state: {
        order: string[];
        sessions: Record<string, WorkoutSession>;
    }) => WorkoutSession[]
>();

const getRecentSelector = (limit: number) => {
    const existing = recentSelectorCache.get(limit);
    if (existing) return existing;

    const selector = (state: {
        order: string[];
        sessions: Record<string, WorkoutSession>;
    }) =>
        state.order
            .slice(0, limit)
            .map((id) => state.sessions[id])
            .filter(Boolean);

    recentSelectorCache.set(limit, selector);
    return selector;
};

// Selectors
export const useRecentSessions = (limit = 5) =>
    useWorkoutHistory(useShallow(getRecentSelector(limit)));
