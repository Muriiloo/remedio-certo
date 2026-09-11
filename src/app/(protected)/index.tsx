import { checkAndResetDailyMedications } from "@/database/check-and-reset-daily-medications";
import { hoursToSeconds } from "@/helpers/hours-to-seconds";
import { useAuth } from "@/hooks/useAuth";
import { useRemedies } from "@/hooks/useRemedies";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NextMedicationCard from "../../components/next-medication-card";
import "../../global.css";

const LIMIT = 5;

export default function Index() {
  const { loggedUser } = useAuth();
  const { remedy, loadRemedies } = useRemedies();
  const [loading, setLoading] = useState(false);
  const db = useSQLiteContext();

  function formatDate(date: Date) {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const now = new Date().toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
  });
  const nowSeconds = hoursToSeconds(now);

  function nearestMedication() {
    if (!remedy || remedy.length === 0) {
      return null;
    }

    const remedyNotTaken = remedy.filter((r) => r.was_taken !== "S");

    // verifico se tem algum remédio futuro, ou seja, segundos positivos
    const futuros = remedyNotTaken.filter(
      (r) => hoursToSeconds(r.time_to_take) - nowSeconds >= 0,
    );

    if (futuros.length > 0) {
      const result = futuros.reduce((closest, current) => {
        const difClosest = hoursToSeconds(closest.time_to_take) - nowSeconds;
        const difCurrent = hoursToSeconds(current.time_to_take) - nowSeconds;
        return difCurrent < difClosest ? current : closest;
      });

      return result.was_taken === "S" ? null : result;
    }

    if (remedyNotTaken.length === 0) {
      return null;
    }

    const result = remedyNotTaken.reduce((earliest, current) => {
      const secondsCurrent = hoursToSeconds(current.time_to_take);

      const secondsEarliest = hoursToSeconds(earliest.time_to_take);

      return secondsCurrent < secondsEarliest ? current : earliest;
    });

    return result.was_taken === "S" ? null : result;
  }

  async function takeMedication(id: number) {
    setLoading(true);
    const hasTakeMedication = remedy.find((item) => item.id === id);
    if (!hasTakeMedication) {
      Alert.alert("Erro", "Medicação não cadastrada.");
      return;
    }

    if (hasTakeMedication.was_taken === "S") {
      Alert.alert("Aviso", "Medicação já foi tomada.");
      return;
    }

    try {
      await db.runAsync(`UPDATE remedy SET was_taken = 'S' where id = ?`, [id]);
      await loadRemedies();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a medicação.");
    } finally {
      setLoading(false);
    }
  }

  if (!loggedUser) {
    return <Redirect href="/sign-in" />;
  }

  useFocusEffect(() => {
    (async () => {
      await checkAndResetDailyMedications(db);
      await loadRemedies();
    })();
  });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#038bbb]">
      <View className="p-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-4xl font-medium">
              Olá {loggedUser.name}
            </Text>
            <Text className="text-white text-lg">{formatDate(new Date())}</Text>
          </View>
          <Ionicons name="person-circle-outline" size={60} color="white" />
        </View>
      </View>
      <View className="flex-1 bg-[#ebe7e0] rounded-t-3xl">
        <ScrollView>
          <NextMedicationCard
            loading={loading}
            onNearestMedication={nearestMedication}
            onTakeMedication={takeMedication}
          />
          <View className="flex gap-4 m-8 bg-white py-6 px-4 rounded-xl">
            <Text className="text-black font-semibold text-2xl">
              Rotina de Hoje
            </Text>
            <View className="border-b border-red" />
            <ScrollView>
              {remedy?.length === 0 ? (
                <View>
                  <Text className="text-gray-500 text-xl text-center">
                    Nenhum remédio cadastrado.
                  </Text>
                </View>
              ) : (
                remedy.slice(0, LIMIT).map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center gap-4 flex-1"
                  >
                    <Ionicons name="medical" size={60} color="#038bbb" />
                    <View className="flex-row flex-1 justify-between">
                      <View>
                        <Text className="text-2xl font-medium">
                          {item.name}
                        </Text>
                        <Text>{item.time_to_take}</Text>
                      </View>
                      <View>
                        {item.was_taken === "S" ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={50}
                            color="#22c55e"
                          />
                        ) : (
                          <Ionicons name="hourglass" size={50} color="gray" />
                        )}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
