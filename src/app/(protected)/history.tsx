import { getRemedies, getTakenDoses } from "@/database/remedies";
import { hoursToSeconds } from "@/helpers/hours-to-seconds";
import {
  dateKey,
  dosesFor,
  nowInSeconds,
  type Dose,
} from "@/helpers/schedule";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAYS = 7;

type HistoryDay = {
  date: Date;
  doses: Dose[];
};

export default function History() {
  const { loggedUser } = useAuth();
  const db = useSQLiteContext();
  const [history, setHistory] = useState<HistoryDay[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!loggedUser) return;

      (async () => {
        const from = new Date();
        from.setDate(from.getDate() - (DAYS - 1));

        const [remedies, taken] = await Promise.all([
          getRemedies(db, loggedUser.id),
          getTakenDoses(db, dateKey(from)),
        ]);

        const nowSeconds = nowInSeconds();
        const days = Array.from({ length: DAYS }, (_, index) => {
          const date = new Date();
          date.setDate(date.getDate() - index);

          let doses = dosesFor(remedies, date, taken);
          // hoje só contam as doses cujo horário já passou
          if (index === 0) {
            doses = doses.filter(
              (dose) => dose.taken || hoursToSeconds(dose.time) <= nowSeconds,
            );
          }
          return { date, doses };
        });

        setHistory(days);
      })();
    }, [db, loggedUser]),
  );

  const total = history.reduce((sum, day) => sum + day.doses.length, 0);
  const taken = history.reduce(
    (sum, day) => sum + day.doses.filter((dose) => dose.taken).length,
    0,
  );
  const daysWithDoses = history.filter((day) => day.doses.length > 0);

  function formatDay(date: Date) {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#038bbb]">
      <View className="p-6">
        <View className="flex-row items-center gap-3">
          <Ionicons name="time" size={32} color="white" />
          <Text className="text-white text-4xl font-medium">Histórico</Text>
        </View>
      </View>

      <View className="flex-1 bg-[#ebe7e0] rounded-t-3xl">
        <ScrollView contentContainerClassName="p-6 gap-3">
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-lg text-gray-700">Últimos {DAYS} dias</Text>
            {total === 0 ? (
              <Text className="text-gray-500 text-center mt-2">
                Nenhuma dose prevista neste período.
              </Text>
            ) : (
              <>
                <Text className="text-5xl font-bold text-[#038bbb]">
                  {Math.round((taken / total) * 100)}%
                </Text>
                <Text className="text-base text-gray-500">
                  {taken} de {total} doses tomadas
                </Text>
              </>
            )}
          </View>

          {daysWithDoses.map((day) => (
            <View key={dateKey(day.date)} className="bg-white rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-medium text-gray-900 capitalize">
                  {formatDay(day.date)}
                </Text>
                <Text className="text-sm text-gray-500">
                  {day.doses.filter((dose) => dose.taken).length} de{" "}
                  {day.doses.length}
                </Text>
              </View>
              {day.doses.map((dose) => (
                <View
                  key={`${dose.remedyId}-${dose.time}`}
                  className="flex-row items-center gap-2 py-1"
                >
                  <Ionicons
                    name={dose.taken ? "checkmark-circle" : "close-circle"}
                    size={22}
                    color={dose.taken ? "#22c55e" : "#dc2626"}
                  />
                  <Text className="flex-1 text-base text-gray-900">
                    {dose.name}
                  </Text>
                  <Text className="text-sm text-gray-500">{dose.time}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
