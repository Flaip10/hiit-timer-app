import type { Workout, WorkoutBlock } from '@src/core/entities/entities';
import type {
    WorkoutSession,
    WorkoutSessionStats,
} from '@src/core/entities/workoutSession.interfaces';
import { prepareRunData } from '@src/core/timer';

export interface MarketingDemoRunSnapshot {
    stepIndex: number;
    remainingSec: number;
    running: boolean;
    awaitingBlockContinue: boolean;
    isFinished: boolean;
    stats: WorkoutSessionStats;
}

const MARKETING_DEMO_ANCHOR_MS = Date.UTC(2026, 2, 23, 7, 30, 0, 0);

const cloneValue = <T>(value: T): T => {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value)) as T;
};

const createTimedExercise = (
    id: string,
    name: string,
    value: number
): WorkoutBlock['exercises'][number] => ({
    id,
    name,
    mode: 'time',
    value,
});

const createWorkout = (
    id: string,
    name: string,
    updatedAtOffsetHours: number,
    isFavorite: boolean,
    blocks: WorkoutBlock[]
): Workout => ({
    id,
    name,
    blocks,
    isFavorite,
    updatedAtMs: MARKETING_DEMO_ANCHOR_MS - updatedAtOffsetHours * 60 * 60 * 1000,
});

const fullBodyHiit = createWorkout(
    'demo-workout-full-body-hiit',
    'Full Body HIIT',
    1,
    true,
    [
        {
            id: 'demo-block-power-start',
            title: 'Power Start',
            sets: 3,
            restBetweenSetsSec: 35,
            restBetweenExercisesSec: 15,
            exercises: [
                createTimedExercise('demo-ex-burpees', 'Burpees', 30),
                createTimedExercise('demo-ex-squat-jacks', 'Squat Jacks', 30),
                createTimedExercise('demo-ex-high-knees', 'High Knees', 25),
            ],
        },
        {
            id: 'demo-block-upper-blast',
            title: 'Upper Blast',
            sets: 3,
            restBetweenSetsSec: 30,
            restBetweenExercisesSec: 20,
            exercises: [
                createTimedExercise('demo-ex-push-ups', 'Push-Ups', 25),
                createTimedExercise(
                    'demo-ex-shoulder-taps',
                    'Shoulder Taps',
                    30
                ),
            ],
        },
        {
            id: 'demo-block-core-finisher',
            title: 'Core Finisher',
            sets: 2,
            restBetweenSetsSec: 25,
            restBetweenExercisesSec: 15,
            exercises: [
                createTimedExercise('demo-ex-v-ups', 'V-Ups', 30),
                createTimedExercise(
                    'demo-ex-hollow-hold',
                    'Hollow Hold',
                    25
                ),
            ],
        },
    ]
);

const quickCore = createWorkout('demo-workout-quick-core', 'Quick Core', 5, false, [
    {
        id: 'demo-block-core-ignite',
        title: 'Core Ignite',
        sets: 3,
        restBetweenSetsSec: 25,
        restBetweenExercisesSec: 12,
        exercises: [
            createTimedExercise('demo-ex-dead-bug', 'Dead Bug', 30),
            createTimedExercise('demo-ex-bicycle-crunch', 'Bicycle Crunch', 30),
            createTimedExercise('demo-ex-plank-reach', 'Plank Reach', 25),
        ],
    },
    {
        id: 'demo-block-anti-rotation',
        title: 'Anti-Rotation',
        sets: 2,
        restBetweenSetsSec: 20,
        restBetweenExercisesSec: 15,
        exercises: [
            createTimedExercise('demo-ex-side-plank', 'Side Plank', 30),
            createTimedExercise('demo-ex-heel-taps', 'Heel Taps', 25),
        ],
    },
]);

const legBurner = createWorkout('demo-workout-leg-burner', 'Leg Burner', 9, false, [
    {
        id: 'demo-block-leg-heat',
        title: 'Leg Heat',
        sets: 4,
        restBetweenSetsSec: 30,
        restBetweenExercisesSec: 15,
        exercises: [
            createTimedExercise('demo-ex-squat-pulses', 'Squat Pulses', 30),
            createTimedExercise('demo-ex-reverse-lunges', 'Reverse Lunges', 30),
            createTimedExercise('demo-ex-skater-hops', 'Skater Hops', 25),
        ],
    },
    {
        id: 'demo-block-glute-drive',
        title: 'Glute Drive',
        sets: 2,
        restBetweenSetsSec: 30,
        restBetweenExercisesSec: 15,
        exercises: [
            createTimedExercise('demo-ex-glute-bridge', 'Glute Bridge', 35),
            createTimedExercise('demo-ex-wall-sit', 'Wall Sit', 40),
        ],
    },
]);

const morningCardio = createWorkout(
    'demo-workout-morning-cardio',
    'Morning Cardio',
    14,
    false,
    [
        {
            id: 'demo-block-easy-start',
            title: 'Easy Start',
            sets: 3,
            restBetweenSetsSec: 20,
            restBetweenExercisesSec: 10,
            exercises: [
                createTimedExercise('demo-ex-step-jacks', 'Step Jacks', 35),
                createTimedExercise('demo-ex-knee-drives', 'Knee Drives', 30),
            ],
        },
        {
            id: 'demo-block-pick-up',
            title: 'Pick Up The Pace',
            sets: 3,
            restBetweenSetsSec: 25,
            restBetweenExercisesSec: 10,
            exercises: [
                createTimedExercise('demo-ex-fast-feet', 'Fast Feet', 30),
                createTimedExercise(
                    'demo-ex-standing-sprints',
                    'Standing Sprints',
                    25
                ),
                createTimedExercise('demo-ex-jump-rope', 'Jump Rope', 35),
            ],
        },
    ]
);

const tabata = createWorkout('demo-workout-tabata', 'Tabata 20/10', 2, true, [
    {
        id: 'demo-block-tabata',
        title: 'Classic Tabata',
        sets: 8,
        restBetweenSetsSec: 10,
        restBetweenExercisesSec: 0,
        exercises: [
            createTimedExercise('demo-ex-sprint-in-place', 'Sprint In Place', 20),
        ],
    },
]);

const expressSweat = createWorkout(
    'demo-workout-express-sweat',
    'Express Sweat',
    18,
    false,
    [
        {
            id: 'demo-block-express',
            title: 'Express Push',
            sets: 3,
            restBetweenSetsSec: 20,
            restBetweenExercisesSec: 10,
            exercises: [
                createTimedExercise('demo-ex-jump-squats', 'Jump Squats', 25),
                createTimedExercise('demo-ex-plank-jacks', 'Plank Jacks', 20),
            ],
        },
        {
            id: 'demo-block-last-minute',
            title: 'Last Minute',
            sets: 1,
            restBetweenSetsSec: 0,
            restBetweenExercisesSec: 10,
            exercises: [
                createTimedExercise('demo-ex-bear-crawl', 'Bear Crawl', 30),
                createTimedExercise('demo-ex-mountain-climbers', 'Mountain Climbers', 30),
            ],
        },
    ]
);

const MARKETING_DEMO_WORKOUTS: Workout[] = [
    fullBodyHiit,
    tabata,
    quickCore,
    legBurner,
    morningCardio,
    expressSweat,
];

const MARKETING_DEMO_WORKOUTS_BY_ID: Record<string, Workout> =
    MARKETING_DEMO_WORKOUTS.reduce<Record<string, Workout>>((acc, workout) => {
        acc[workout.id] = workout;
        return acc;
    }, {});

const createSession = (args: {
    id: string;
    workoutId: string;
    startedAtOffsetHours: number;
    totalDurationSec: number;
    stats: WorkoutSessionStats;
}): WorkoutSession => {
    const workout = MARKETING_DEMO_WORKOUTS_BY_ID[args.workoutId];
    const startedAtMs =
        MARKETING_DEMO_ANCHOR_MS - args.startedAtOffsetHours * 60 * 60 * 1000;

    return {
        id: args.id,
        startedAtMs,
        endedAtMs: startedAtMs + args.totalDurationSec * 1000,
        workoutId: workout.id,
        workoutNameSnapshot: workout.name,
        workoutSnapshot: cloneValue(workout),
        totalDurationSec: args.totalDurationSec,
        stats: cloneValue(args.stats),
    };
};

const MARKETING_DEMO_HISTORY_SESSIONS: WorkoutSession[] = [
    createSession({
        id: 'demo-session-full-body',
        workoutId: fullBodyHiit.id,
        startedAtOffsetHours: 4,
        totalDurationSec: 880,
        stats: {
            completedSets: 8,
            completedExercises: 19,
            totalWorkSec: 530,
            totalRestSec: 335,
            totalPrepSec: 15,
            totalPausedSec: 0,
            totalBlockPauseSec: 0,
            completedSetsByBlock: [3, 3, 2],
            completedExercisesByBlock: [9, 6, 4],
            workSecByBlock: [255, 165, 110],
            restSecByBlock: [160, 120, 55],
            prepSecByBlock: [5, 5, 5],
        },
    }),
    createSession({
        id: 'demo-session-tabata',
        workoutId: tabata.id,
        startedAtOffsetHours: 22,
        totalDurationSec: 255,
        stats: {
            completedSets: 8,
            completedExercises: 8,
            totalWorkSec: 160,
            totalRestSec: 80,
            totalPrepSec: 5,
            totalPausedSec: 0,
            totalBlockPauseSec: 0,
            completedSetsByBlock: [8],
            completedExercisesByBlock: [8],
            workSecByBlock: [160],
            restSecByBlock: [80],
            prepSecByBlock: [5],
        },
    }),
    createSession({
        id: 'demo-session-quick-core',
        workoutId: quickCore.id,
        startedAtOffsetHours: 31,
        totalDurationSec: 575,
        stats: {
            completedSets: 5,
            completedExercises: 13,
            totalWorkSec: 350,
            totalRestSec: 215,
            totalPrepSec: 10,
            totalPausedSec: 0,
            totalBlockPauseSec: 0,
            completedSetsByBlock: [3, 2],
            completedExercisesByBlock: [9, 4],
            workSecByBlock: [255, 95],
            restSecByBlock: [126, 89],
            prepSecByBlock: [5, 5],
        },
    }),
    createSession({
        id: 'demo-session-morning-cardio',
        workoutId: morningCardio.id,
        startedAtOffsetHours: 53,
        totalDurationSec: 715,
        stats: {
            completedSets: 6,
            completedExercises: 15,
            totalWorkSec: 465,
            totalRestSec: 240,
            totalPrepSec: 10,
            totalPausedSec: 0,
            totalBlockPauseSec: 0,
            completedSetsByBlock: [3, 3],
            completedExercisesByBlock: [6, 9],
            workSecByBlock: [195, 270],
            restSecByBlock: [85, 155],
            prepSecByBlock: [5, 5],
        },
    }),
    createSession({
        id: 'demo-session-leg-burner',
        workoutId: legBurner.id,
        startedAtOffsetHours: 78,
        totalDurationSec: 995,
        stats: {
            completedSets: 6,
            completedExercises: 16,
            totalWorkSec: 620,
            totalRestSec: 365,
            totalPrepSec: 10,
            totalPausedSec: 0,
            totalBlockPauseSec: 0,
            completedSetsByBlock: [4, 2],
            completedExercisesByBlock: [12, 4],
            workSecByBlock: [340, 280],
            restSecByBlock: [240, 125],
            prepSecByBlock: [5, 5],
        },
    }),
    createSession({
        id: 'demo-session-express-sweat',
        workoutId: expressSweat.id,
        startedAtOffsetHours: 101,
        totalDurationSec: 360,
        stats: {
            completedSets: 4,
            completedExercises: 8,
            totalWorkSec: 225,
            totalRestSec: 125,
            totalPrepSec: 10,
            totalPausedSec: 0,
            totalBlockPauseSec: 0,
            completedSetsByBlock: [3, 1],
            completedExercisesByBlock: [6, 2],
            workSecByBlock: [135, 90],
            restSecByBlock: [80, 45],
            prepSecByBlock: [5, 5],
        },
    }),
];

const MARKETING_DEMO_HISTORY_SESSIONS_BY_ID: Record<string, WorkoutSession> =
    MARKETING_DEMO_HISTORY_SESSIONS.reduce<Record<string, WorkoutSession>>(
        (acc, session) => {
            acc[session.id] = session;
            return acc;
        },
        {}
    );

const marketingDemoRunPlan = prepareRunData(fullBodyHiit, 5);
const finishedRunStats = MARKETING_DEMO_HISTORY_SESSIONS[0].stats;

if (!finishedRunStats) {
    throw new Error('Missing marketing demo finished run stats');
}

const getStepIndex = (stepId: string): number => {
    const index = marketingDemoRunPlan.steps.findIndex((step) => step.id === stepId);

    if (index < 0) {
        throw new Error(`Missing marketing demo step: ${stepId}`);
    }

    return index;
};

const MARKETING_DEMO_RUN_SNAPSHOTS: Record<
    'run-work' | 'run-rest' | 'run-finished',
    MarketingDemoRunSnapshot
> = {
    'run-work': {
        stepIndex: getStepIndex('work-1-1-1'),
        remainingSec: 18,
        running: true,
        awaitingBlockContinue: false,
        isFinished: false,
        stats: {
            completedSets: 3,
            completedExercises: 11,
            totalWorkSec: 305,
            totalRestSec: 156,
            totalPrepSec: 10,
            totalPausedSec: 0,
            totalBlockPauseSec: 0,
            completedSetsByBlock: [3, 0, 0],
            completedExercisesByBlock: [9, 2, 0],
            workSecByBlock: [255, 50, 0],
            restSecByBlock: [160, 16, 0],
            prepSecByBlock: [5, 5, 0],
        },
    },
    'run-rest': {
        stepIndex: getStepIndex('rest-ex-1-1-0'),
        remainingSec: 9,
        running: true,
        awaitingBlockContinue: false,
        isFinished: false,
        stats: {
            completedSets: 3,
            completedExercises: 10,
            totalWorkSec: 275,
            totalRestSec: 146,
            totalPrepSec: 10,
            totalPausedSec: 0,
            totalBlockPauseSec: 0,
            completedSetsByBlock: [3, 0, 0],
            completedExercisesByBlock: [9, 1, 0],
            workSecByBlock: [255, 20, 0],
            restSecByBlock: [160, 0, 0],
            prepSecByBlock: [5, 5, 0],
        },
    },
    'run-finished': {
        stepIndex: marketingDemoRunPlan.steps.length - 1,
        remainingSec: 0,
        running: false,
        awaitingBlockContinue: false,
        isFinished: true,
        stats: cloneValue(finishedRunStats),
    },
};

export const getMarketingDemoWorkouts = (): Workout[] =>
    cloneValue(MARKETING_DEMO_WORKOUTS);

export const getMarketingDemoWorkoutById = (id?: string): Workout | undefined => {
    if (!id) return undefined;
    const workout = MARKETING_DEMO_WORKOUTS_BY_ID[id];
    return workout ? cloneValue(workout) : undefined;
};

export const getMarketingDemoPrimaryWorkout = (): Workout =>
    cloneValue(fullBodyHiit);

export const getMarketingDemoEditorWorkout = (): Workout =>
    cloneValue(fullBodyHiit);

export const getMarketingDemoHistorySessions = (): WorkoutSession[] =>
    cloneValue(MARKETING_DEMO_HISTORY_SESSIONS);

export const getMarketingDemoHistorySessionById = (
    id?: string
): WorkoutSession | undefined => {
    if (!id) return undefined;
    const session = MARKETING_DEMO_HISTORY_SESSIONS_BY_ID[id];
    return session ? cloneValue(session) : undefined;
};

export const getMarketingDemoRunPlan = () => marketingDemoRunPlan;

export const getMarketingDemoRunSnapshot = (
    target: 'run-work' | 'run-rest' | 'run-finished'
): MarketingDemoRunSnapshot => cloneValue(MARKETING_DEMO_RUN_SNAPSHOTS[target]);
