import type { Remedy } from "@/contexts/remedyContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface NextMedicationCardProps {
  onNearestMedication: () => Remedy | null;
}

const NextMedicationCard = ({
  onNearestMedication,
}: NextMedicationCardProps) => {
  const nearestMedication = onNearestMedication();

  return (
    <View className="flex gap-4 mx-8 my-4 bg-white py-6 px-4 rounded-xl">
      <View className="flex-row items-center justify-between gap-6 ">
        <Text className="text-black font-medium text-2xl">
          Minha Próxima Medicação
        </Text>
        <Ionicons name="calendar" size={30} color="#038bbb" />
      </View>
      <View className="flex-row gap-4 ">
        <Ionicons name="medical" size={60} color="#038bbb" />
        {nearestMedication ? (
          <View className="flex-1 flex-row justify-between">
            <View>
              <Text className="text-2xl font-medium">
                {nearestMedication.name}
              </Text>
              <Text className="font-medium">
                {nearestMedication.quantity} comprimido (s)
              </Text>
            </View>
            <View>
              <Text className="font-semibold text-2xl">
                {nearestMedication.time_to_take}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-1 flex-row justify-between">
            <View>
              <Text className="text-2xl font-medium">
                Nenhum remédio cadastrado.
              </Text>
            </View>
          </View>
        )}
      </View>
      <Pressable className="bg-emerald-500 p-4 rounded-full">
        <Text className="text-white text-center font-bold text-xl">
          JÁ TOMEI!
        </Text>
      </Pressable>
    </View>
  );
};

export default NextMedicationCard;
