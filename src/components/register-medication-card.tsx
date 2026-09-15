import { useAuth } from "@/hooks/useAuth";
import { scheduleMedicationNotification } from "@/services/notifications";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

interface RegisterMedicationCardProps {
  onClose: () => void;
  onOpen: boolean;
  onRemedyCreated: () => Promise<void>;
}

export default function RegisterMedicationCard({
  onClose,
  onOpen,
  onRemedyCreated,
}: RegisterMedicationCardProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [timeToTake, setTimeToTake] = useState("");
  const { loggedUser } = useAuth();
  const db = useSQLiteContext();

  async function handleSave() {
    if (!loggedUser) return;

    if (!name.trim() || !quantity.trim() || !timeToTake.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert(
        "Erro",
        "O nome do remédio deve ter pelo menos 3 caracteres.",
      );
      return;
    }

    if (timeToTake.length <= 4 || timeToTake.length === 7) {
      Alert.alert(
        "Erro",
        "Por favor, insira um horário válido no formato HH:MM:SS.",
      );
      return;
    }

    try {
      const result = await db.runAsync(
        "INSERT INTO remedy (name, quantity, time_to_take, person_id) VALUES (?, ?, ?, ?)",
        [name, quantity, timeToTake, loggedUser.id],
      );
      await onRemedyCreated();
      await scheduleMedicationNotification({
        id: result.lastInsertRowId,
        name,
        quantity: Number(quantity),
        time_to_take: timeToTake
      })
      onClose();
      setName("");
      setQuantity("");
      setTimeToTake("");
    } catch (error) {
      console.error("Error saving medication:", error);
    }
  }

  return (
    <Modal
      onRequestClose={onClose}
      visible={onOpen}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center px-4"
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6"
          >
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-2">
                <View className="bg-[#038bbb]/10 p-2 rounded-full">
                  <MaterialCommunityIcons
                    name="pill"
                    size={22}
                    color="#038bbb"
                  />
                </View>
                <Text className="text-xl font-semibold text-gray-900">
                  Cadastro de Remédio
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                className="p-1 rounded-full active:bg-gray-100"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#9ca3af"
                />
              </Pressable>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Nome do remédio
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Paracetamol"
                  placeholderTextColor="#9ca3af"
                  className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Quantidade
                </Text>
                <TextInput
                  value={quantity}
                  onChangeText={(prev) => {
                    let cleaned = prev.replace(/[^0-9]/g, "");

                    if (cleaned.length > 2) {
                      cleaned = cleaned.slice(0, 2);
                    }

                    setQuantity(cleaned);
                  }}
                  placeholder="Ex: 1 comprimido"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Horário de uso
                </Text>
                <TextInput
                  value={timeToTake}
                  onChangeText={(prev) => {
                    let cleaned = prev.replace(/[^0-9]/g, "");
                    if (cleaned.length > 6) {
                      cleaned = cleaned.slice(0, 6);
                    }

                    let hh = cleaned.slice(0, 2);
                    let mm = cleaned.slice(2, 4);
                    let ss = cleaned.slice(4, 6);

                    if (hh.length === 2 && parseInt(hh, 10) > 23) hh = "23";
                    if (mm.length === 2 && parseInt(mm, 10) > 59) mm = "59";
                    if (ss.length === 2 && parseInt(ss, 10) > 59) ss = "59";

                    let formatted = hh;

                    if (cleaned.length > 2) {
                      formatted = formatted + ":" + mm;
                    }
                    if (cleaned.length > 4) {
                      formatted = formatted + ":" + ss;
                    }
                    setTimeToTake(formatted);
                  }}
                  placeholder="Ex: 08:30:00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                />
              </View>
            </View>

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={onClose}
                className="flex-1 items-center py-3.5 rounded-xl border border-gray-300 active:opacity-70"
              >
                <Text className="text-base font-medium text-gray-700">
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                className="flex-1 items-center py-3.5 rounded-xl bg-[#038bbb] active:opacity-80"
              >
                <Text className="text-base font-semibold text-white">
                  Salvar
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
