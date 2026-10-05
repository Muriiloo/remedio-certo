import { ALL_DAYS, dateKey, doseKey } from "@/helpers/schedule";
import type { SQLiteDatabase } from "expo-sqlite";

export type Remedy = {
  id: number;
  name: string;
  // unidades por dose
  quantity: number;
  times: string[];
  // 0 = domingo
  days: number[];
  end_date: string | null;
  created_at: string;
  // unidades disponíveis; null = sem controle de estoque
  stock: number | null;
  person_id: number;
};

type RemedyRow = {
  id: number;
  name: string;
  quantity: number;
  // horários separados por vírgula
  time_to_take: string;
  days_of_week: string | null;
  end_date: string | null;
  created_at: string | null;
  stock: number | null;
  person_id: number;
};

type NewRemedy = Omit<Remedy, "id" | "created_at">;

const COLUMNS =
  "id, name, quantity, time_to_take, days_of_week, end_date, created_at, stock, person_id";

// dias de tratamento restantes para considerar o estoque baixo
const LOW_STOCK_DAYS = 3;

function toRemedy(row: RemedyRow): Remedy {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    times: row.time_to_take.split(","),
    days: row.days_of_week ? row.days_of_week.split(",").map(Number) : ALL_DAYS,
    end_date: row.end_date,
    created_at: row.created_at ?? "",
    stock: row.stock,
    person_id: row.person_id,
  };
}

// sem personId retorna os remédios de todos os usuários
export async function getRemedies(db: SQLiteDatabase, personId?: number) {
  const rows =
    personId === undefined
      ? await db.getAllAsync<RemedyRow>(`SELECT ${COLUMNS} FROM remedy`)
      : await db.getAllAsync<RemedyRow>(
          `SELECT ${COLUMNS} FROM remedy WHERE person_id = ? ORDER BY name`,
          [personId],
        );

  return rows.map(toRemedy);
}

export async function createRemedy(db: SQLiteDatabase, remedy: NewRemedy) {
  await db.runAsync(
    `INSERT INTO remedy (name, quantity, time_to_take, days_of_week, end_date, created_at, stock, person_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      remedy.name,
      remedy.quantity,
      remedy.times.join(","),
      remedy.days.length === 7 ? null : remedy.days.join(","),
      remedy.end_date,
      dateKey(new Date()),
      remedy.stock,
      remedy.person_id,
    ],
  );
}

export async function getTakenDoses(db: SQLiteDatabase, fromDate: string) {
  const rows = await db.getAllAsync<{
    remedy_id: number;
    date: string;
    time: string;
  }>("SELECT remedy_id, date, time FROM dose_log WHERE date >= ?", [fromDate]);

  return new Set(rows.map((row) => doseKey(row.remedy_id, row.date, row.time)));
}

// registra a dose e dá baixa no estoque; retorna null se a dose já estava registrada
export async function takeDose(
  db: SQLiteDatabase,
  remedyId: number,
  date: string,
  time: string,
) {
  const result = await db.runAsync(
    `INSERT OR IGNORE INTO dose_log (remedy_id, date, time, taken_at)
     VALUES (?, ?, ?, datetime('now', 'localtime'))`,
    [remedyId, date, time],
  );
  if (result.changes === 0) return null;

  await db.runAsync(
    "UPDATE remedy SET stock = MAX(stock - quantity, 0) WHERE id = ? AND stock IS NOT NULL",
    [remedyId],
  );

  const row = await db.getFirstAsync<RemedyRow>(
    `SELECT ${COLUMNS} FROM remedy WHERE id = ?`,
    [remedyId],
  );
  return row ? toRemedy(row) : null;
}

export async function addStock(
  db: SQLiteDatabase,
  remedyId: number,
  units: number,
) {
  await db.runAsync(
    "UPDATE remedy SET stock = COALESCE(stock, 0) + ? WHERE id = ?",
    [units, remedyId],
  );
}

export function isLowStock(remedy: Remedy) {
  if (remedy.stock === null) return false;
  return remedy.stock <= remedy.quantity * remedy.times.length * LOW_STOCK_DAYS;
}
