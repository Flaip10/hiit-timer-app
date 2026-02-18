import type { I18nResource } from './interfaces';

export const ptPT: I18nResource = {
    common: {
        actions: {
            back: 'Voltar',
            cancel: 'Cancelar',
            remove: 'Remover',
            edit: 'Editar',
            start: 'Iniciar',
            share: 'Partilhar',
            done: 'Concluído',
        },
        status: {
            noTimeEstimate: 'Sem estimativa de tempo',
            mixedTimeAndReps: 'Misto (tempo + repetições)',
        },
        units: {
            block_one: '{{count}} bloco',
            block_other: '{{count}} blocos',
            set_one: '{{count}} série',
            set_other: '{{count}} séries',
            exercise_one: '{{count}} exercício',
            exercise_other: '{{count}} exercícios',
        },
        labels: {
            blockWithIndex: 'Bloco {{index}}',
            exerciseWithIndex: 'Exercício {{index}}',
        },
    },
    drawer: {
        home: 'Início',
        workouts: 'Treinos',
        history: 'Histórico',
        settings: 'Definições',
        quickAccess: 'Acesso rápido',
    },
    home: {
        title: 'Início',
        welcome: 'Bem-vindo',
        subtitle: 'Começa já o teu treino.',
        quickWorkout: 'Treino rápido',
        startImmediately: 'Começar imediatamente',
        recentWorkouts: 'Treinos recentes',
        noSessionsYet: 'Ainda não existem sessões.',
    },
    history: {
        title: 'Histórico',
        searchPlaceholder: 'Pesquisar treinos',
        clear: 'Limpar',
        emptyTitle: 'Ainda não existem sessões',
        emptyDescription: 'Executa um treino e ele aparecerá aqui.',
        clearConfirm: {
            title: 'Limpar histórico',
            message: 'Todas as sessões serão eliminadas.',
            confirm: 'Limpar',
            cancel: 'Cancelar',
        },
    },
    historySession: {
        title: 'Sessão',
        notFound: 'Sessão não encontrada',
        workoutSessionFallback: 'Sessão de treino',
        endedAt: 'Terminou {{time}}',
        byBlock: 'Por bloco',
        noCompletedBlocks: 'Sem blocos concluídos nesta sessão',
        blockStats: {
            sets: 'Séries:',
            exercises: 'Exercícios:',
            work: 'Trabalho:',
            rest: 'Descanso:',
        },
        actions: {
            openWorkout: 'Abrir treino',
            saveWorkout: 'Guardar treino',
            runAgain: 'Repetir treino',
        },
        hints: {
            noSavedWorkout:
                'Nenhum treino guardado encontrado para esta sessão.',
            workoutEditedSinceSession:
                'O treino foi editado desde esta sessão.',
        },
    },
    workoutBlockItem: {
        summary: {
            timeEach: '{{value}}s cada',
            repsEach: '{{value}} repetições cada',
        },
        exerciseMeta: {
            time: '{{value}}s',
            reps_one: '{{count}} repetição',
            reps_other: '{{count}} repetições',
            rest: 'Descanso {{value}}s',
        },
        labels: {
            exerciseWithIndex: 'Exercício {{index}}',
        },
    },
    settings: {
        title: 'Definições',
        sections: {
            appearance: 'Aparência',
            sound: 'Som',
            language: 'Idioma',
            about: 'Sobre',
        },
        descriptions: {
            theme: 'Seleciona o tema preferido',
            accent: 'Seleciona a cor de destaque preferida',
            sound: 'Ativa efeitos sonoros',
            language: 'Seleciona o idioma preferido',
        },
        theme: {
            light: 'Claro',
            dark: 'Escuro',
            system: 'Sistema',
        },
        sound: {
            on: 'Ligado',
            off: 'Desligado',
        },
        languages: {
            en: 'Inglês',
            ptPT: 'Português (Portugal)',
        },
        accents: {
            classic: 'Clássico',
            violet: 'Violeta',
            cyan: 'Ciano',
            amber: 'Âmbar',
            neutral: 'Neutro',
        },
        about: {
            version: 'Versão {{version}}',
        },
    },
    workouts: {
        title: 'Treinos',
        searchPlaceholder: 'Pesquisar treinos',
        newButton: '＋ Novo',
        createButton: '＋ Criar treino',
        emptyTitle: 'Ainda não existem treinos',
        emptyDescription: 'Cria o teu primeiro treino para começar.',
        item: {
            untitled: 'Treino sem nome',
        },
        confirmRemove: {
            title: 'Remover treino',
            message: 'Isto irá eliminar o treino permanentemente.',
            confirm: 'Remover',
            cancel: 'Cancelar',
        },
        modal: {
            title: 'Novo treino',
            subtitle: 'Escolhe como queres começar:',
            createNew: 'Criar novo',
            importFromFile: 'Importar de ficheiro',
            cancel: 'Cancelar',
        },
        import: {
            errors: {
                invalidExtension:
                    'Esse ficheiro não é um treino ARC Timer (.arcw).',
                invalidKind:
                    'Esse ficheiro não é uma exportação de treino ARC Timer.',
                invalidShape:
                    'Esse ficheiro parece uma exportação ARC Timer, mas faltam dados.',
                parseFailed: 'O ficheiro está corrompido ou não é JSON válido.',
                readFailed: 'Não foi possível ler o ficheiro selecionado.',
                unexpected: 'A importação falhou devido a um erro inesperado.',
            },
        },
    },
    workoutSummary: {
        title: 'Treino',
        notFound: 'Treino não encontrado.',
        overview: 'Visão geral',
        favorite: 'Favorito',
        cardTitle: 'Resumo do treino',
        metrics: {
            blocks: 'Blocos',
            exercises: 'Exercícios',
            estimatedTime: 'Tempo estimado',
        },
        blocksSection: 'Blocos',
        hint: 'Podes editar este treino ou iniciá-lo agora.',
        shareWorkout: 'Partilhar treino',
        actions: {
            edit: 'Editar',
            start: 'Iniciar',
        },
        export: {
            sharingUnavailable:
                'A partilha não está disponível neste dispositivo.',
            writeFailed: 'Não foi possível preparar o ficheiro para partilha.',
            failed: 'Falha ao exportar treino.',
        },
    },
    run: {
        title: 'Executar treino',
        emptyTitle: 'Sem passos para executar',
        emptyDescription:
            'Este treino não tem passos temporizados configurados.',
        donePill: 'Concluído',
        phase: {
            work: 'Trabalho',
            setRest: 'Descanso da série',
            rest: 'Descanso',
            prepare: 'Preparar',
        },
        top: {
            blocks: 'Blocos',
            exercises: 'Exercícios',
            completeTitle: 'Treino concluído',
        },
        section: {
            nextBlock: 'Próximo bloco:',
            exercise: 'Exercício',
            next: 'Próximo',
        },
        confirmEnd: {
            title: 'Terminar treino?',
            message: 'O teu progresso até agora será guardado no resumo.',
            confirm: 'Terminar treino',
            cancel: 'Continuar',
        },
        actions: {
            backToHome: 'Voltar ao início',
            holdToStartBlock: 'Manter para iniciar bloco',
            end: 'Terminar',
            skip: 'Saltar',
            start: 'Iniciar',
            pause: 'Pausar',
            resume: 'Retomar',
            continue: 'Continuar',
            done: 'Concluído',
        },
        stats: {
            title: 'Estatísticas da sessão',
            duration: 'Duração',
            sets: 'Séries',
            exercises: 'Exercícios',
            workTime: 'Tempo de trabalho',
            restTime: 'Tempo de descanso',
            pausedTime: 'Tempo em pausa',
        },
        shareCard: {
            title: 'Treino concluído',
        },
    },
};
