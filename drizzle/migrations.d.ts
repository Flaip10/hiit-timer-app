interface MigrationJournalEntry {
    idx: number;
    when: number;
    tag: string;
    breakpoints: boolean;
}

interface MigrationJournal {
    entries: MigrationJournalEntry[];
}

interface ExpoSqliteMigrations {
    journal: MigrationJournal;
    migrations: Record<string, string>;
}

declare const migrations: ExpoSqliteMigrations;

export default migrations;
