import { handleNotificationResponse } from "@/services/notifications";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

const NOTIFICATION_TASK = "medication-notification-task";

// no Android, roda quando um botão da notificação é tocado com o app fechado
if (Platform.OS !== "web") {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(
    NOTIFICATION_TASK,
    async ({ data }) => {
      if ("actionIdentifier" in data) {
        await handleNotificationResponse(data);
      }
    },
  );

  Notifications.registerTaskAsync(NOTIFICATION_TASK);
}
