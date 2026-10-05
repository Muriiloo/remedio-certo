import type { SQLiteDatabase } from "expo-sqlite";

export const DATABASE_NAME = "remedio-certo.db";

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
            
        CREATE TABLE IF NOT EXISTS app_meta (
            key TEXT PRIMARY KEY,
            value TEXT
    );
    
    `);

  await runMigrations(database);
}

async function runMigrations(database: SQLiteDatabase) {
  const result = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await database.execAsync(`ALTER TABLE remedy ADD COLUMN was_token TEXT;`);
    currentVersion = 1;
  }

  if (currentVersion < 2) {
    await database.execAsync(`ALTER TABLE remedy ADD COLUMN was_taken TEXT;`);
    currentVersion = 2;
  }

  if (currentVersion < 3) {
    await database.execAsync(`
        ALTER TABLE remedy ADD COLUMN stock INTEGER;
        ALTER TABLE remedy ADD COLUMN days_of_week TEXT;
        ALTER TABLE remedy ADD COLUMN end_date TEXT;
        ALTER TABLE remedy ADD COLUMN created_at TEXT;
        UPDATE remedy SET created_at = date('now', 'localtime');

        ALTER TABLE person ADD COLUMN emergency_name TEXT;
        ALTER TABLE person ADD COLUMN emergency_phone TEXT;

        CREATE TABLE IF NOT EXISTS dose_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            remedy_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            taken_at TEXT NOT NULL,
            UNIQUE (remedy_id, date, time),
            FOREIGN KEY (remedy_id) REFERENCES remedy (id)
        );

        -- preserva as doses já marcadas hoje no modelo antigo (was_taken)
        INSERT OR IGNORE INTO dose_log (remedy_id, date, time, taken_at)
        SELECT id, date('now', 'localtime'), time_to_take, datetime('now', 'localtime')
        FROM remedy
        WHERE was_taken = 'S'
          AND EXISTS (
            SELECT 1 FROM app_meta
            WHERE key = 'last_reset_date'
              AND value = strftime('%d/%m/%Y', 'now', 'localtime')
          );
    `);
    currentVersion = 3;
  }

  await database.execAsync(`PRAGMA user_version = ${currentVersion};`);
}
