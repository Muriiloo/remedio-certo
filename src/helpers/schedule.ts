import type { Remedy } from "@/database/remedies";
import { hoursToSeconds } from "@/helpers/hours-to-seconds";

export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export type Dose = {
  remedyId: number;
  name: string;
  quantity: number;
  time: string;
  taken: boolean;
};

// data local no formato YYYY-MM-DD
export function dateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function doseKey(remedyId: number, date: string, time: string) {
  return `${remedyId}|${date}|${time}`;
}

export function nowInSeconds() {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

export function isActiveOn(remedy: Remedy, date: Date) {
  const key = dateKey(date);
  if (key < remedy.created_at) return false;
  if (remedy.end_date && key > remedy.end_date) return false;
  return remedy.days.includes(date.getDay());
}

export function dosesFor(
  remedies: Remedy[],
  date: Date,
  taken: Set<string>,
): Dose[] {
  const key = dateKey(date);

  return remedies
    .filter((remedy) => isActiveOn(remedy, date))
    .flatMap((remedy) =>
      remedy.times.map((time) => ({
        remedyId: remedy.id,
        name: remedy.name,
        quantity: remedy.quantity,
        time,
        taken: taken.has(doseKey(remedy.id, key, time)),
      })),
    )
    .sort((a, b) => hoursToSeconds(a.time) - hoursToSeconds(b.time));
}

export function formatDays(days: number[]) {
  if (days.length === 7) return "Todos os dias";
  return days.map((day) => WEEKDAYS[day]).join(", ");
}

export function formatDateBR(key: string) {
  const [year, month, day] = key.split("-");
  return `${day}/${month}/${year}`;
}

// converte DD/MM/AAAA em YYYY-MM-DD; retorna null se a data não existir
export function parseDateBR(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  if (value.length !== 10 || !day || !month || !year) return null;

  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  return dateKey(date);
}
