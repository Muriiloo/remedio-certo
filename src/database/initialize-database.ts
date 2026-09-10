import type { SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(database: SQLiteDatabase) {
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS person (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            age INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS remedy (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            time_to_take TEXT NOT NULL,
            person_id INTEGER NOT NULL,
            FOREIGN KEY (person_id) REFERENCES person (id)
            );
    
    `);

    await runMigrations(database)
}

async function runMigrations(database: SQLiteDatabase) {
    const result = await database.getFirstAsync<{ user_version: number }>(
        "PRAGMA user_version"
    );
    let currentVersion = result?.user_version ?? 0;

    if (currentVersion < 1) {
        await database.execAsync(
            `ALTER TABLE remedy ADD COLUMN was_token TEXT;`
        );
        currentVersion = 1;
    }

    await database.execAsync(`PRAGMA user_version = ${currentVersion};`);
}
