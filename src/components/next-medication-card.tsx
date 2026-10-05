import type { Dose } from "@/helpers/schedule";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface NextMedicationCardProps {
  dose: Dose | null;
  late: boolean;
  onTakeMedication: (dose: Dose) => Promise<void>;
  loading: boolean;
}

const NextMedicationCard = ({
  dose,
  late,
  onTakeMedication,
  loading,
}: NextMedicationCardProps) => {
  return (
    <>
      {dose && (
        <View className="flex gap-4 mx-8 my-4 bg-white py-6 px-4 rounded-xl">
          <View className="flex-row items-center justify-between gap-6 ">
            <Text className="text-black font-medium text-2xl">
              Minha Próxima Medicação
            </Text>
            <Ionicons name="calendar" size={30} color="#038bbb" />
          </View>
          <View className="flex-row gap-4 ">
            <Ionicons name="medical" size={60} color="#038bbb" />

            <View className="flex-1 flex-row justify-between">
              <View>
                <Text className="text-2xl font-medium">{dose.name}</Text>
                <Text className="font-medium">
                  {dose.quantity} comprimido (s)
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className={`font-semibold text-2xl ${late ? "text-red-600" : ""}`}
                >
                  {dose.time}
                </Text>
                {late && (
                  <Text className="text-red-600 font-medium">Atrasado</Text>
                )}
              </View>
            </View>
          </View>
          <Pressable
            className="bg-emerald-500 p-4 rounded-full"
            disabled={loading}
            onPress={() => onTakeMedication(dose)}
          >
            <Text className="text-white text-center font-bold text-xl">
              {loading ? "Carregando..." : "JÁ TOMEI!"}
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );
};

export default NextMedicationCard;
