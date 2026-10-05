import { DATABASE_NAME } from "@/database/initialize-database";
import {
  getRemedies,
  isLowStock,
  takeDose,
  type Remedy,
} from "@/database/remedies";
import { dateKey } from "@/helpers/schedule";
import * as Notifications from "expo-notifications";
import * as SQLite from "expo-sqlite";
import { Alert, Platform } from "react-native";

const CHANNEL_ID = "medications";
const CATEGORY_ID = "medication";
const ACTION_TAKEN = "taken";
const ACTION_SNOOZE = "snooze";
const SNOOZE_SECONDS = 10 * 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Lembretes de remédios",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    {
      identifier: ACTION_TAKEN,
      buttonTitle: "Já tomei",
      options: { opensAppToForeground: false },
    },
    {
      identifier: ACTION_SNOOZE,
      buttonTitle: "Lembrar em 10 min",
      options: { opensAppToForeground: false },
    },
  ]);

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status: newStatus } = await Notifications.requestPermissionsAsync();
  if (newStatus !== "granted") {
    Alert.alert("Aviso", "Sem permissão de notificação.");
    return false;
  }

  return newStatus === "granted";
}

function snoozeIdentifier(remedyId: number, time: string) {
  return `snooze-${remedyId}-${time}`;
}

// recria os lembretes de todos os remédios a partir do banco
export async function syncMedicationNotifications(db: SQLite.SQLiteDatabase) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => request.identifier.startsWith("remedy-"))
      .map((request) =>
        Notifications.cancelScheduledNotificationAsync(request.identifier),
      ),
  );

  const today = dateKey(new Date());
  const remedies = await getRemedies(db);

  for (const remedy of remedies) {
    if (remedy.end_date && remedy.end_date < today) continue;

    for (const time of remedy.times) {
      const [hour, minute] = time.split(":").map(Number);
      const content = {
        title: "Hora do remédio!!💊",
        body: `${remedy.name} - ${remedy.quantity} unidade(s).`,
        data: { remedyId: remedy.id, time },
        sound: true,
        categoryIdentifier: CATEGORY_ID,
      };

      if (remedy.days.length === 7) {
        await Notifications.scheduleNotificationAsync({
          identifier: `remedy-${remedy.id}-${time}`,
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: CHANNEL_ID,
          },
        });
        continue;
      }

      for (const day of remedy.days) {
        await Notifications.scheduleNotificationAsync({
          identifier: `remedy-${remedy.id}-${time}-${day}`,
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            // no trigger semanal, 1 = domingo
            weekday: day + 1,
            hour,
            minute,
            channelId: CHANNEL_ID,
          },
        });
      }
    }
  }
}

export function cancelSnooze(remedyId: number, time: string) {
  return Notifications.cancelScheduledNotificationAsync(
    snoozeIdentifier(remedyId, time),
  );
}

export function notifyLowStock(remedy: Remedy) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Remédio acabando",
      body: `${remedy.name}: restam ${remedy.stock} unidade(s).`,
    },
    trigger: null,
  });
}

// trata os botões "Já tomei" e "Lembrar em 10 min" da notificação
export async function handleNotificationResponse(
  response: Notifications.NotificationResponse,
) {
  const { actionIdentifier, notification } = response;
  if (actionIdentifier !== ACTION_TAKEN && actionIdentifier !== ACTION_SNOOZE) {
    return;
  }

  const { content, identifier } = notification.request;
  const data = content.data as
    | { remedyId?: number; time?: string; date?: string }
    | undefined;
  if (!data?.remedyId || !data.time) return;

  // a dose pertence ao dia em que a notificação chegou, não ao dia do toque
  const receivedAt =
    notification.date < 1e12 ? notification.date * 1000 : notification.date;
  const date = data.date ?? dateKey(new Date(receivedAt || Date.now()));

  if (actionIdentifier === ACTION_TAKEN) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const remedy = await takeDose(db, data.remedyId, date, data.time);
    if (remedy && isLowStock(remedy)) {
      await notifyLowStock(remedy);
    }
  } else {
    await Notifications.scheduleNotificationAsync({
      identifier: snoozeIdentifier(data.remedyId, data.time),
      content: {
        title: content.title,
        body: content.body,
        data: { remedyId: data.remedyId, time: data.time, date },
        sound: true,
        categoryIdentifier: CATEGORY_ID,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: SNOOZE_SECONDS,
        channelId: CHANNEL_ID,
      },
    });
  }

  await Notifications.dismissNotificationAsync(identifier);
}
