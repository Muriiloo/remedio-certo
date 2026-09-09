import { useAuth } from "@/hooks/useAuth";
import { useRemedies } from "@/hooks/useRemedies";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useFocusEffect } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NextMedicationCard from "../../components/next-medication-card";
import "../../global.css";

const LIMIT = 5;

export default function Index() {
  const { loggedUser } = useAuth();
  const { remedy, loadRemedies } = useRemedies();

  function formatDate(date: Date) {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (!loggedUser) {
    return <Redirect href="/sign-in" />;
  }

  useFocusEffect(() => {
    loadRemedies();
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
          <NextMedicationCard />
          <View className="flex gap-4 m-8 bg-white py-6 px-4 rounded-xl">
            <Text className="text-black font-semibold text-2xl">
              Rotina de Hoje
            </Text>
            <View className="border-b border-red" />
            <ScrollView>
              {remedy.slice(0, LIMIT).map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center gap-4 flex-1"
                >
                  <Ionicons name="medical" size={60} color="#038bbb" />
                  <View className="flex-row flex-1 justify-between">
                    <View>
                      <Text className="text-2xl font-medium">{item.name}</Text>
                      <Text>{item.time_to_take}</Text>
                    </View>
                    <View>
                      <Ionicons
                        name="checkmark-circle"
                        size={50}
                        color="#22c55e"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
