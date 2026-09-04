import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

const NextMedicationCard = () => {
  return (
    <View className="flex gap-4 m-8 bg-white py-6 px-4 rounded-xl">
      <View className="flex-row items-center justify-between gap-6 ">
        <Text className="text-black font-medium text-2xl">Minha Próxima Medicação</Text>
        <Ionicons name="calendar" size={30} color="#038bbb" />
      </View>
      <View className="flex-row gap-4 ">
        <Ionicons name="medical" size={60} color="#038bbb" />
        <View className="flex-1 flex-row justify-between">
          <View>
            <Text className="text-2xl font-medium">Forxiga</Text>
            <Text className="font-medium">1 comprimido</Text>
          </View>
          <View>
            <Text className="font-semibold text-2xl">10:00</Text>
          </View>
        </View>
      </View>
      <Pressable className="bg-emerald-500 p-4 rounded-full">
        <Text className="text-white text-center font-bold text-xl">JÁ TOMEI!</Text>
      </Pressable>
    </View>
  );
}

export default NextMedicationCard;