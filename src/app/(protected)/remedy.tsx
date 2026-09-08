import RegisterMedicationCard from "@/components/register-medication-card";
import { useAuth } from "@/hooks/useAuth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type Remedy = {
  id: number;
  name: string;
  quantity: number;
  time_to_take: string;
  person_id: number;
};

export default function Remedy() {
  const [remedy, setRemedy] = useState<Remedy[]>([]);
  const { loggedUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const db = useSQLiteContext();

  const loadRemedies = useCallback(async () => {
    if (!loggedUser) return;

    const result = await db.getAllAsync<Remedy>(
      "SELECT id, name, quantity, time_to_take FROM remedy WHERE person_id = ? ORDER BY time_to_take",
      [loggedUser.id],
    );
    setRemedy(result);
  }, [db, loggedUser]);

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
          <FlatList
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
                  {item.quantity && (
                    <Text className="text-sm text-gray-500">
                      {item.quantity}
                    </Text>
                  )}
                </View>
                {item.time_to_take && (
                  <Text className="text-sm font-medium text-gray-700">
                    {item.time_to_take}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </SafeAreaView>
      <RegisterMedicationCard
        onOpen={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
