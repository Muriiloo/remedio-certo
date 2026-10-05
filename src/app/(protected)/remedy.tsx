import RegisterMedicationCard from "@/components/register-medication-card";
import RestockCard from "@/components/restock-card";
import { isLowStock, type Remedy as RemedyItem } from "@/database/remedies";
import { formatDateBR, formatDays } from "@/helpers/schedule";
import { useRemedies } from "@/hooks/useRemedies";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Remedy() {
  const { remedy, loadRemedies } = useRemedies();
  const [modalVisible, setModalVisible] = useState(false);
  const [restocking, setRestocking] = useState<RemedyItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadRemedies();
    }, [loadRemedies]),
  );

  return (
    <>
      <SafeAreaView edges={["top"]} className="flex-1 bg-[#038bbb]">
        <View className="p-6">
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons name="pill" size={32} color="white" />
            <Text className="text-white text-4xl font-medium">Remédios</Text>
          </View>
        </View>

        <View className="relative flex-1 bg-[#ebe7e0] rounded-t-3xl">
          <Pressable
            className="p-4 bg-[#038bbb] rounded-full absolute right-6 bottom-6 z-10"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-white text-2xl font-bold">+</Text>
          </Pressable>
          <View className="px-6 pt-6">
            <Text className="text-3xl font-medium text-gray-900">
              Lista de remédios
            </Text>
          </View>
          <FlatList
            className="flex-1"
            data={remedy}
            keyExtractor={(item) => String(item.id)}
            contentContainerClassName="p-6 gap-3"
            ListEmptyComponent={
              <View className="bg-white rounded-lg p-6 items-center">
                <Text className="text-gray-500">
                  Nenhum remédio cadastrado ainda.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View className="bg-white rounded-lg p-4 flex-row items-center gap-3">
                <MaterialCommunityIcons name="pill" size={24} color="#038bbb" />
                <View className="flex-1">
                  <Text className="text-lg font-medium text-gray-900">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {item.quantity} unidade(s) por dose
                  </Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {item.times.join(" · ")}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {formatDays(item.days)}
                    {item.end_date && ` · até ${formatDateBR(item.end_date)}`}
                  </Text>
                  {item.stock !== null && (
                    <Text
                      className={`text-sm font-medium ${
                        isLowStock(item) ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      Estoque: {item.stock} unidade(s)
                      {isLowStock(item) && " - acabando"}
                    </Text>
                  )}
                </View>
                <Pressable
                  className="px-3 py-2 rounded-full border border-[#038bbb] active:opacity-70"
                  onPress={() => setRestocking(item)}
                >
                  <Text className="text-sm font-medium text-[#038bbb]">
                    Repor
                  </Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
      <RegisterMedicationCard
        onRemedyCreated={loadRemedies}
        onOpen={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <RestockCard
        remedy={restocking}
        onRestocked={loadRemedies}
        onClose={() => setRestocking(null)}
      />
    </>
  );
}
