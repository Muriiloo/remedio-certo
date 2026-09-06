import { AuthProvider } from "@/contexts/authContext";
import { initializeDatabase } from "@/database/initialize-database";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="remedio-certo.db" onInit={initializeDatabase}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(protected)" />
          <Stack.Screen name="sign-in" />
        </Stack>
      </AuthProvider>
    </SQLiteProvider>
  );
}
