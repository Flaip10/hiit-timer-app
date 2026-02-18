export interface I18nResource {
    common: {
        actions: {
            back: string;
            cancel: string;
            remove: string;
            edit: string;
            start: string;
            share: string;
            done: string;
        };
        status: {
            noTimeEstimate: string;
            mixedTimeAndReps: string;
        };
        units: {
            block_one: string;
            block_other: string;
            set_one: string;
            set_other: string;
            exercise_one: string;
            exercise_other: string;
        };
        labels: {
            blockWithIndex: string;
            exerciseWithIndex: string;
        };
    };
    drawer: {
        home: string;
        workouts: string;
        history: string;
        settings: string;
        quickAccess: string;
    };
    home: {
        title: string;
        welcome: string;
        subtitle: string;
        quickWorkout: string;
        startImmediately: string;
        recentWorkouts: string;
        noSessionsYet: string;
    };
    history: {
        title: string;
        searchPlaceholder: string;
        clear: string;
        emptyTitle: string;
        emptyDescription: string;
        clearConfirm: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
    };
    settings: {
        title: string;
        sections: {
            appearance: string;
            sound: string;
            language: string;
            about: string;
        };
        descriptions: {
            theme: string;
            accent: string;
            sound: string;
            language: string;
        };
        theme: {
            light: string;
            dark: string;
            system: string;
        };
        sound: {
            on: string;
            off: string;
        };
        languages: {
            en: string;
            ptPT: string;
        };
        accents: {
            classic: string;
            violet: string;
            cyan: string;
            amber: string;
            neutral: string;
        };
        about: {
            version: string;
        };
    };
    workouts: {
        title: string;
        searchPlaceholder: string;
        newButton: string;
        createButton: string;
        emptyTitle: string;
        emptyDescription: string;
        item: {
            untitled: string;
        };
        confirmRemove: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
        modal: {
            title: string;
            subtitle: string;
            createNew: string;
            importFromFile: string;
            cancel: string;
        };
        import: {
            errors: {
                invalidExtension: string;
                invalidKind: string;
                invalidShape: string;
                parseFailed: string;
                readFailed: string;
                unexpected: string;
            };
        };
    };
    workoutSummary: {
        title: string;
        notFound: string;
        overview: string;
        favorite: string;
        cardTitle: string;
        metrics: {
            blocks: string;
            exercises: string;
            estimatedTime: string;
        };
        blocksSection: string;
        hint: string;
        shareWorkout: string;
        actions: {
            edit: string;
            start: string;
        };
        export: {
            sharingUnavailable: string;
            writeFailed: string;
            failed: string;
        };
    };
    run: {
        title: string;
        emptyTitle: string;
        emptyDescription: string;
        donePill: string;
        phase: {
            work: string;
            setRest: string;
            rest: string;
            prepare: string;
        };
        top: {
            blocks: string;
            exercises: string;
            completeTitle: string;
        };
        section: {
            nextBlock: string;
            exercise: string;
            next: string;
        };
        confirmEnd: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
        actions: {
            backToHome: string;
            holdToStartBlock: string;
            end: string;
            skip: string;
            start: string;
            pause: string;
            resume: string;
            continue: string;
            done: string;
        };
        stats: {
            title: string;
            duration: string;
            sets: string;
            exercises: string;
            workTime: string;
            restTime: string;
            pausedTime: string;
        };
        shareCard: {
            title: string;
        };
    };
}
