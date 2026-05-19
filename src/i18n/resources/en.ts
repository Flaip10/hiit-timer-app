import type { I18nResource } from './interfaces';

export const en: I18nResource = {
    common: {
        actions: {
            back: 'Back',
            cancel: 'Cancel',
            remove: 'Remove',
            edit: 'Edit',
            start: 'Start',
            share: 'Share',
            done: 'Done',
        },
        status: {
            noTimeEstimate: 'No time estimate',
            mixedTimeAndReps: 'Mixed (time + reps)',
        },
        units: {
            block_one: '{{count}} block',
            block_other: '{{count}} blocks',
            set_one: '{{count}} set',
            set_other: '{{count}} sets',
            exercise_one: '{{count}} exercise',
            exercise_other: '{{count}} exercises',
        },
        labels: {
            blockWithIndex: 'Block {{index}}',
            exerciseWithIndex: 'Exercise {{index}}',
        },
    },
    drawer: {
        home: 'Home',
        workouts: 'Workouts',
        exercises: 'Exercises',
        history: 'History',
        settings: 'Settings',
        quickAccess: 'Quick access',
    },
    bootstrap: {
        databaseError: {
            title: 'Something went wrong',
            description:
                'Arc Timer could not get your data ready. Restart your app or try again.',
            retry: 'Try again',
        },
    },
    home: {
        title: 'Home',
        welcome: 'Welcome',
        subtitle: 'Get started with your training.',
        quickWorkout: 'Quick Workout',
        startImmediately: 'Start immediately',
        recentWorkouts: 'Recent Workouts',
        noSessionsYet: 'No sessions yet.',
    },
    history: {
        title: 'History',
        searchPlaceholder: 'Search workouts',
        clear: 'Clear',
        emptyTitle: 'No sessions yet',
        emptyDescription: 'Run a workout and it will appear here.',
        clearConfirm: {
            title: 'Clear history',
            message: 'All workout sessions will be deleted.',
            confirm: 'Clear',
            cancel: 'Cancel',
        },
    },
    historySession: {
        title: 'Session',
        notFound: 'Session not found',
        workoutSessionFallback: 'Workout session',
        endedAt: 'Ended {{time}}',
        byBlock: 'By block',
        noCompletedBlocks: 'No completed blocks in this session',
        blockStats: {
            sets: 'Sets:',
            exercises: 'Exercises:',
            work: 'Work:',
            rest: 'Rest:',
        },
        actions: {
            openWorkout: 'Open workout',
            saveWorkout: 'Save workout',
            runAgain: 'Run again',
            delete: 'Delete',
        },
        deleteConfirm: {
            title: 'Delete session',
            message: 'This workout session will be permanently deleted.',
            confirm: 'Delete',
            cancel: 'Cancel',
        },
        hints: {
            noSavedWorkout: 'No saved workout found for this session.',
            workoutEditedSinceSession: 'Workout edited since this session.',
        },
    },
    workoutBlockItem: {
        summary: {
            timeEach: '{{value}}s each',
            repsEach: '{{value}} reps each',
        },
        exerciseMeta: {
            time: '{{value}}s',
            reps_one: '{{count}} rep',
            reps_other: '{{count}} reps',
            rest: 'Rest {{value}}s',
        },
        labels: {
            exerciseWithIndex: 'Exercise {{index}}',
        },
    },
    editWorkout: {
        title: {
            edit: 'Edit Workout',
            create: 'New Workout',
        },
        fields: {
            name: 'Name',
            namePlaceholder: 'e.g., Conditioning A',
        },
        defaults: {
            newWorkout: 'New Workout',
        },
        sections: {
            blocks: 'Blocks',
        },
        hints: {
            tapBlockToEdit: 'Tap a block to edit its details.',
        },
        actions: {
            addBlock: '＋ Add Block',
            cancel: 'Cancel',
            save: 'Save',
            create: 'Create',
        },
        validation: {
            nameRequired: 'Workout name is required.',
            addBlock: 'Add at least one block.',
            exerciseNamesRequired: 'Exercises must have defined names.',
        },
        removeBlock: {
            title: 'Remove block',
            message:
                'This will permanently delete the block from this workout.',
            confirm: 'Remove',
            cancel: 'Cancel',
        },
    },
    editBlock: {
        title: {
            edit: 'Edit Block',
            quick: 'Quick Workout',
        },
        notFound: 'Block not found.',
        sections: {
            setup: 'Block setup',
            structure: 'Exercises',
            timing: 'Rest',
            exercises: 'Exercises',
        },
        fields: {
            blockTitle: 'Block name',
            exerciseDurationSec: 'Duration',
            restBetweenExercisesSec: 'Between exercises',
            setsInBlock: 'Sets',
            restBetweenSetsSec: 'Between sets',
        },
        units: {
            secondsShort: 's',
        },
        actions: {
            addExercise: '＋ Add Exercise',
            cancel: 'Cancel',
            startWorkout: 'Start Workout',
            saveBlock: 'Save Block',
        },
        removeExercise: {
            title: 'Remove exercise',
            message: 'This exercise will be removed from the block.',
            confirm: 'Remove',
            cancel: 'Cancel',
        },
        validation: {
            setsMin: 'Block must have at least one set.',
            exercisesMin: 'Add at least one exercise.',
            exerciseNameRequired:
                'Exercise {{index}}: name is required before saving.',
            exerciseDurationMin:
                'Exercise {{index}}: duration must be > 0 seconds.',
            exerciseRepsMin: 'Exercise {{index}}: reps must be > 0.',
        },
    },
    settings: {
        title: 'Settings',
        sections: {
            appearance: 'Appearance',
            sound: 'Sound',
            language: 'Language',
            about: 'About',
        },
        descriptions: {
            theme: 'Select your preferred theme',
            accent: 'Select your preferred color accent',
            sound: 'Enable sound effects',
            language: 'Select your preferred language',
        },
        theme: {
            light: 'Light',
            dark: 'Dark',
            system: 'System',
        },
        sound: {
            on: 'On',
            off: 'Off',
        },
        languages: {
            en: 'English',
            ptPT: 'Portuguese (Portugal)',
        },
        accents: {
            classic: 'Classic',
            violet: 'Violet',
            cyan: 'Cyan',
            amber: 'Amber',
            neutral: 'Neutral',
        },
        about: {
            version: 'Version {{version}}',
        },
    },
    workouts: {
        title: 'Workouts',
        searchPlaceholder: 'Search workouts',
        newButton: '＋ New',
        createButton: '＋ Create workout',
        defaults: {
            quickWorkoutName: 'Quick Workout',
            quickBlockTitle: 'Quick Block',
        },
        emptyTitle: 'No workouts yet',
        emptyDescription: 'Create your first workout to get started.',
        item: {
            untitled: 'Untitled workout',
        },
        confirmRemove: {
            title: 'Remove workout',
            message: 'This will permanently delete the workout.',
            confirm: 'Remove',
            cancel: 'Cancel',
        },
        modal: {
            title: 'New workout',
            subtitle: 'Choose how you want to start:',
            createNew: 'Create new',
            importFromFile: 'Import from file',
            cancel: 'Cancel',
        },
        import: {
            errors: {
                invalidExtension:
                    'That file is not an ARC Timer workout (.arcw).',
                invalidKind: 'That file is not an ARC Timer workout export.',
                invalidShape:
                    'That file looks like an ARC Timer export, but it is missing data.',
                parseFailed: 'The file is corrupted or not valid JSON.',
                readFailed: 'Could not read the selected file.',
                unexpected: 'Import failed due to an unexpected error.',
            },
        },
    },
    exerciseDefinitions: {
        title: 'Exercises',
        detailsTitle: 'Exercise',
        searchPlaceholder: 'Search exercises',
        newButton: '＋ New',
        createButton: '＋ Create exercise',
        emptyTitle: 'No exercises yet',
        emptyDescription:
            'Create your first exercise to build your catalog.',
        notFound: 'Exercise not found.',
        overview: 'Overview',
        fields: {
            name: 'Name',
            namePlaceholder: 'e.g., Push-ups',
            availability: 'Availability',
            source: 'Source',
        },
        source: {
            system: 'System',
            user: 'Custom',
        },
        availability: {
            both: 'Workout + Gym',
            workout: 'Workout',
            gym: 'Gym',
        },
        modal: {
            createTitle: 'New exercise',
            editTitle: 'Edit exercise',
            subtitle: 'Keep your exercise catalog clear and reusable.',
            create: 'Create',
            save: 'Save',
        },
        validation: {
            nameRequired: 'Exercise name is required.',
        },
    },
    workoutSummary: {
        title: 'Workout',
        notFound: 'Workout not found.',
        overview: 'Overview',
        favorite: 'Favorite',
        cardTitle: 'Workout summary',
        metrics: {
            blocks: 'Blocks',
            exercises: 'Exercises',
            estimatedTime: 'Estimated time',
        },
        blocksSection: 'Blocks',
        hint: 'You can edit this workout or start it now.',
        shareWorkout: 'Share workout',
        actions: {
            edit: 'Edit',
            start: 'Start',
        },
        export: {
            sharingUnavailable: 'Sharing is not available on this device.',
            writeFailed: 'Could not prepare the file for sharing.',
            failed: 'Failed to export workout.',
        },
    },
    run: {
        title: 'Run workout',
        emptyTitle: 'No steps to run',
        emptyDescription: 'This workout has no timed steps configured.',
        donePill: 'Done',
        phase: {
            work: 'Work',
            setRest: 'Set rest',
            rest: 'Rest',
            prepare: 'Prepare',
        },
        top: {
            blocks: 'Blocks',
            exercises: 'Exercises',
            completeTitle: 'Workout complete',
        },
        section: {
            nextBlock: 'Next Block:',
            exercise: 'Exercise',
            next: 'Next',
        },
        confirmEnd: {
            title: 'End workout?',
            message: 'Your progress will be saved in the summary.',
            confirm: 'End workout',
            cancel: 'Keep going',
        },
        actions: {
            backToHome: 'Back to home',
            holdToStartBlock: 'Hold to start Block',
            end: 'End',
            skip: 'Skip',
            start: 'Start',
            pause: 'Pause',
            resume: 'Resume',
            continue: 'Continue',
            done: 'Done',
        },
        stats: {
            title: 'Session stats',
            duration: 'Duration',
            sets: 'Sets',
            exercises: 'Exercises',
            workTime: 'Work time',
            restTime: 'Rest time',
            pausedTime: 'Paused time',
        },
        shareCard: {
            title: 'Workout complete',
        },
    },
};
