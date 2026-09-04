import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NextMedicationCard from "../components/next-medication-card";
import "../global.css";

export default function Index() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#038bbb]">
      <View className="p-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-4xl font-medium">Olá Sr.José!</Text>
            <Text className="text-white text-lg">Quinta-feira, 04 de Setembro.</Text>
          </View>
          <Ionicons name="person-circle-outline" size={60} color="white" />
        </View>
      </View>
      <View className="flex-1 bg-[#ebe7e0] rounded-t-3xl">
        <ScrollView>
          <NextMedicationCard />
          <View className="flex gap-4 m-8 bg-white py-6 px-4 rounded-xl">
            <Text className="text-black font-semibold text-2xl">Rotina de Hoje</Text>
            <View className="border-b border-red" />
            <ScrollView>
              <View className="flex-row items-center gap-4 flex-1">
              <Ionicons name="medical" size={60} color="#038bbb" />
              <View className="flex-row flex-1 justify-between">
                <View>
                  <Text className="text-2xl font-medium">Remédio 1</Text>
                  <Text>Tomar após o almoço</Text>
                </View>
                <View>
                  <Ionicons name="checkmark-circle" size={50} color="#22c55e" />
                </View>
              </View>
            </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
