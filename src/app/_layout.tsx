import { AuthProvider } from "@/contexts/authContext";
import { DATABASE_NAME, initializeDatabase } from "@/database/initialize-database";
import { registerForPushNotifications } from "@/services/notifications";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect } from "react";

export default function RootLayout() {

  useEffect(() => {
    registerForPushNotifications().then()
  }, [])

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(protected)" />
          <Stack.Screen name="sign-in" />
        </Stack>
      </AuthProvider>
    </SQLiteProvider>
  );
}
