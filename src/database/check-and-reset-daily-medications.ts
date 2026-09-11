import type { SQLiteDatabase } from "expo-sqlite";

export async function checkAndResetDailyMedications(database: SQLiteDatabase) {
  const today = new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  const existingValue = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_meta WHERE key = 'last_reset_date'`,
  );

  const lastResetDate = existingValue?.value;

  if (lastResetDate !== today) {
    await database.runAsync(`UPDATE remedy SET was_taken = null`);

    await database.runAsync(
      `INSERT INTO app_meta (key, value) VALUES ('last_reset_date', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [today],
    );
  }
}
