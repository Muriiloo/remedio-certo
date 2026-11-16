import {
  callPharmacy,
  fetchNearbyPharmacies,
  formatDistance,
  getUserCoords,
  openInMaps,
  PharmaciesError,
  type Pharmacy,
} from "@/services/pharmacies";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

const ERROR_MESSAGES = {
  permission:
    "Sem permissão de localização. Ative nas configurações do aparelho para ver as farmácias perto de você.",
  location:
    "Não foi possível obter sua localização. Verifique se o GPS está ativado.",
  network:
    "Não foi possível buscar as farmácias. Verifique sua conexão e tente novamente.",
};

export default function Pharmacies() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { latitude, longitude } = await getUserCoords();
      setPharmacies(await fetchNearbyPharmacies(latitude, longitude));
    } catch (e) {
      setError(
        e instanceof PharmaciesError
          ? ERROR_MESSAGES[e.code]
          : ERROR_MESSAGES.network,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function open(pharmacy: Pharmacy) {
    try {
      await openInMaps(pharmacy);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o mapa.");
    }
  }

  async function call(phone: string) {
    try {
      await callPharmacy(phone);
    } catch {
      Alert.alert("Erro", "Não foi possível iniciar a ligação.");
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#038bbb]">
      <View className="p-6">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={32} color="white" />
          </Pressable>
          <Text className="text-white text-4xl font-medium">Farmácias</Text>
        </View>
      </View>

      <View className="flex-1 bg-[#ebe7e0] rounded-t-3xl">
        <ScrollView contentContainerClassName="p-6 gap-3">
          {loading ? (
            <View className="items-center gap-3 py-10">
              <ActivityIndicator size="large" color="#038bbb" />
              <Text className="text-gray-600 text-lg">
                Buscando farmácias perto de você...
              </Text>
            </View>
          ) : error ? (
            <View className="bg-white rounded-xl p-6 gap-4">
              <Text className="text-lg text-gray-700 text-center">{error}</Text>
              <Pressable
                className="bg-[#038bbb] p-3 rounded-full"
                onPress={load}
              >
                <Text className="text-white text-center font-bold text-lg">
                  Tentar novamente
                </Text>
              </Pressable>
            </View>
          ) : pharmacies.length === 0 ? (
            <View className="bg-white rounded-xl p-6">
              <Text className="text-lg text-gray-500 text-center">
                Nenhuma farmácia encontrada em até 3 km. Os dados vêm do
                OpenStreetMap e podem estar incompletos na sua região.
              </Text>
            </View>
          ) : (
            pharmacies.map((pharmacy) => (
              <View
                key={pharmacy.id}
                className="bg-white rounded-xl p-4 gap-2"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <Text className="flex-1 text-xl font-semibold text-gray-900">
                    {pharmacy.name}
                  </Text>
                  <Text className="text-base font-medium text-[#038bbb]">
                    {formatDistance(pharmacy.distanceMeters)}
                  </Text>
                </View>
                {pharmacy.address && (
                  <Text className="text-base text-gray-600">
                    {pharmacy.address}
                  </Text>
                )}
                {pharmacy.openingHours && (
                  <Text className="text-sm text-gray-500">
                    Horário: {pharmacy.openingHours}
                  </Text>
                )}
                <View className="flex-row gap-3 mt-1">
                  <Pressable
                    className="flex-1 flex-row items-center justify-center gap-2 bg-[#038bbb] p-3 rounded-full"
                    onPress={() => open(pharmacy)}
                  >
                    <Ionicons name="navigate" size={20} color="white" />
                    <Text className="text-white font-bold text-base">
                      Rota
                    </Text>
                  </Pressable>
                  {pharmacy.phone && (
                    <Pressable
                      className="flex-1 flex-row items-center justify-center gap-2 bg-emerald-500 p-3 rounded-full"
                      onPress={() => call(pharmacy.phone!)}
                    >
                      <Ionicons name="call" size={20} color="white" />
                      <Text className="text-white font-bold text-base">
                        Ligar
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))
          )}
          <Text className="text-xs text-gray-500 text-center mt-2">
            Dados © colaboradores do OpenStreetMap
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
