import { isLowStock } from "@/database/remedies";
import { hoursToSeconds } from "@/helpers/hours-to-seconds";
import { nowInSeconds, type Dose } from "@/helpers/schedule";
import { useAuth } from "@/hooks/useAuth";
import { useRemedies } from "@/hooks/useRemedies";
import { sendSms, sendWhatsApp } from "@/services/emergency-contact";
import { openNearbyPharmacies } from "@/services/pharmacies";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NextMedicationCard from "../../components/next-medication-card";
import "../../global.css";

const LIMIT = 5;

// atraso a partir do qual o app sugere avisar o contato de emergência
const LATE_ALERT_SECONDS = 30 * 60;

export default function Index() {
  const { loggedUser } = useAuth();
  const { remedy, doses, loadRemedies, takeDose } = useRemedies();
  const [loading, setLoading] = useState(false);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadRemedies();
    }, [loadRemedies]),
  );

  function formatDate(date: Date) {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const nowSeconds = nowInSeconds();

  function isLate(dose: Dose) {
    return !dose.taken && hoursToSeconds(dose.time) < nowSeconds;
  }

  // a próxima dose futura; se não houver, a mais antiga ainda não tomada
  const pending = doses.filter((dose) => !dose.taken);
  const nextDose =
    pending.find((dose) => hoursToSeconds(dose.time) >= nowSeconds) ??
    pending[0] ??
    null;

  const veryLate = pending.filter(
    (dose) => nowSeconds - hoursToSeconds(dose.time) >= LATE_ALERT_SECONDS,
  );
  const lowStock = remedy.filter(isLowStock);
  const visibleDoses = showAll ? doses : doses.slice(0, LIMIT);

  async function takeMedication(dose: Dose) {
    setLoading(true);

    try {
      await takeDose(dose);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a medicação.");
    } finally {
      setLoading(false);
    }
  }

  async function seeNearbyPharmacies() {
    setLoadingPharmacies(true);
    try {
      await openNearbyPharmacies();
    } finally {
      setLoadingPharmacies(false);
    }
  }

  if (!loggedUser) {
    return <Redirect href="/sign-in" />;
  }

  const emergencyPhone = loggedUser.emergency_phone;
  const emergencyMessage = `Olá! Aqui é ${loggedUser.name}. Ainda não tomei: ${veryLate
    .map((dose) => `${dose.name} (${dose.time})`)
    .join(", ")}.`;

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
          <Pressable onPress={() => router.navigate("/profile")}>
            <Ionicons name="person-circle-outline" size={60} color="white" />
          </Pressable>
        </View>
      </View>
      <View className="flex-1 bg-[#ebe7e0] rounded-t-3xl">
        <ScrollView>
          <NextMedicationCard
            dose={nextDose}
            late={nextDose !== null && isLate(nextDose)}
            loading={loading}
            onTakeMedication={takeMedication}
          />
          {veryLate.length > 0 && emergencyPhone && (
            <View className="flex gap-3 mx-8 mt-4 bg-white py-6 px-4 rounded-xl border border-red-300">
              <View className="flex-row items-center gap-2">
                <Ionicons name="alert-circle" size={28} color="#dc2626" />
                <Text className="text-red-600 font-semibold text-2xl">
                  Dose atrasada
                </Text>
              </View>
              <Text className="text-lg">
                {veryLate
                  .map((dose) => `${dose.name} (${dose.time})`)
                  .join(", ")}
                . Quer avisar {loggedUser.emergency_name ?? "seu contato"}?
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  className="flex-1 bg-emerald-500 p-3 rounded-full"
                  onPress={() => sendWhatsApp(emergencyPhone, emergencyMessage)}
                >
                  <Text className="text-white text-center font-bold text-lg">
                    WhatsApp
                  </Text>
                </Pressable>
                <Pressable
                  className="flex-1 bg-[#038bbb] p-3 rounded-full"
                  onPress={() => sendSms(emergencyPhone, emergencyMessage)}
                >
                  <Text className="text-white text-center font-bold text-lg">
                    SMS
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          {lowStock.length > 0 && (
            <View className="flex gap-2 mx-8 mt-4 bg-white py-6 px-4 rounded-xl border border-amber-300">
              <View className="flex-row items-center gap-2">
                <Ionicons name="warning" size={28} color="#d97706" />
                <Text className="text-amber-600 font-semibold text-2xl">
                  Estoque baixo
                </Text>
              </View>
              {lowStock.map((item) => (
                <Text key={item.id} className="text-lg">
                  {item.name}: restam {item.stock} unidade(s)
                </Text>
              ))}
            </View>
          )}
          <Pressable
            className="flex-row items-center justify-center gap-2 mx-8 mt-4 bg-[#038bbb] p-4 rounded-full"
            disabled={loadingPharmacies}
            onPress={seeNearbyPharmacies}
          >
            <Ionicons name="location" size={24} color="white" />
            <Text className="text-white text-center font-bold text-xl">
              {loadingPharmacies
                ? "Carregando..."
                : "Ver farmácias perto de mim"}
            </Text>
          </Pressable>
          <View className="flex gap-4 m-8 bg-white py-6 px-4 rounded-xl">
            <Text className="text-black font-semibold text-2xl">
              Rotina de Hoje
            </Text>
            <View className="border-b border-red" />
            {doses.length === 0 ? (
              <View>
                <Text className="text-gray-500 text-xl text-center">
                  Nenhum remédio para hoje.
                </Text>
              </View>
            ) : (
              visibleDoses.map((item) => (
                <View
                  key={`${item.remedyId}-${item.time}`}
                  className="flex-row items-center gap-4 flex-1"
                >
                  <Ionicons name="medical" size={60} color="#038bbb" />
                  <View className="flex-row flex-1 justify-between">
                    <View>
                      <Text className="text-2xl font-medium">{item.name}</Text>
                      <Text
                        className={
                          isLate(item) ? "text-red-600 font-medium" : ""
                        }
                      >
                        {item.time}
                        {isLate(item) && " - Atrasado"}
                      </Text>
                    </View>
                    <View>
                      {item.taken ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={50}
                          color="#22c55e"
                        />
                      ) : isLate(item) ? (
                        <Ionicons
                          name="alert-circle"
                          size={50}
                          color="#dc2626"
                        />
                      ) : (
                        <Ionicons name="hourglass" size={50} color="gray" />
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
            {doses.length > LIMIT && (
              <Pressable onPress={() => setShowAll(!showAll)}>
                <Text className="text-[#038bbb] text-center font-semibold text-lg">
                  {showAll ? "Ver menos" : `Ver todos (${doses.length})`}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
