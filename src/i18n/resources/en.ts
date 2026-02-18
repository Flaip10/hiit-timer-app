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
        history: 'History',
        settings: 'Settings',
        quickAccess: 'Quick access',
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
            message: 'Your progress so far will be saved in the summary.',
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
