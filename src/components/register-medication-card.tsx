import StockInput, {
  EMPTY_STOCK,
  isStockIncomplete,
  stockTotal,
} from "@/components/stock-input";
import { createRemedy } from "@/database/remedies";
import { hoursToSeconds } from "@/helpers/hours-to-seconds";
import {
  ALL_DAYS,
  dateKey,
  parseDateBR,
  WEEKDAYS,
} from "@/helpers/schedule";
import { useAuth } from "@/hooks/useAuth";
import { syncMedicationNotifications } from "@/services/notifications";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface RegisterMedicationCardProps {
  onClose: () => void;
  onOpen: boolean;
  onRemedyCreated: () => Promise<void>;
}

function isValidTime(time: string) {
  return time.length === 5 || time.length === 8;
}

export default function RegisterMedicationCard({
  onClose,
  onOpen,
  onRemedyCreated,
}: RegisterMedicationCardProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [timeToTake, setTimeToTake] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [days, setDays] = useState(ALL_DAYS);
  const [endDate, setEndDate] = useState("");
  const [stock, setStock] = useState(EMPTY_STOCK);
  const { loggedUser } = useAuth();
  const db = useSQLiteContext();

  function addTime() {
    if (!isValidTime(timeToTake)) {
      Alert.alert(
        "Erro",
        "Por favor, insira um horário válido no formato HH:MM:SS.",
      );
      return;
    }

    if (!times.includes(timeToTake)) {
      setTimes(
        [...times, timeToTake].sort(
          (a, b) => hoursToSeconds(a) - hoursToSeconds(b),
        ),
      );
    }
    setTimeToTake("");
  }

  function toggleDay(day: number) {
    if (!days.includes(day)) {
      setDays([...days, day].sort());
      return;
    }
    // pelo menos um dia precisa ficar marcado
    if (days.length > 1) {
      setDays(days.filter((d) => d !== day));
    }
  }

  async function handleSave() {
    if (!loggedUser) return;

    // o horário digitado e ainda não adicionado também conta
    const allTimes = [...times];
    if (timeToTake.trim()) {
      if (!isValidTime(timeToTake)) {
        Alert.alert(
          "Erro",
          "Por favor, insira um horário válido no formato HH:MM:SS.",
        );
        return;
      }
      if (!allTimes.includes(timeToTake)) allTimes.push(timeToTake);
    }

    if (!name.trim() || !quantity.trim() || allTimes.length === 0) {
      Alert.alert(
        "Erro",
        "Por favor, preencha o nome, a quantidade e pelo menos um horário.",
      );
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert(
        "Erro",
        "O nome do remédio deve ter pelo menos 3 caracteres.",
      );
      return;
    }

    if (Number(quantity) < 1) {
      Alert.alert("Erro", "A quantidade por dose deve ser pelo menos 1.");
      return;
    }

    let parsedEndDate: string | null = null;
    if (endDate.trim()) {
      parsedEndDate = parseDateBR(endDate);
      if (!parsedEndDate || parsedEndDate < dateKey(new Date())) {
        Alert.alert(
          "Erro",
          "Por favor, insira uma data de término válida no formato DD/MM/AAAA.",
        );
        return;
      }
    }

    if (isStockIncomplete(stock)) {
      Alert.alert(
        "Erro",
        "Informe o número de caixas e as unidades por caixa.",
      );
      return;
    }

    try {
      await createRemedy(db, {
        name: name.trim(),
        quantity: Number(quantity),
        times: allTimes.sort((a, b) => hoursToSeconds(a) - hoursToSeconds(b)),
        days,
        end_date: parsedEndDate,
        stock: stockTotal(stock),
        person_id: loggedUser.id,
      });
      await onRemedyCreated();
      await syncMedicationNotifications(db);
      onClose();
      setName("");
      setQuantity("");
      setTimeToTake("");
      setTimes([]);
      setDays(ALL_DAYS);
      setEndDate("");
      setStock(EMPTY_STOCK);
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
            className="bg-white rounded-3xl p-6 max-h-[90%]"
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

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-4"
            >
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
                  Quantidade por dose
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
                  Horários de uso
                </Text>
                <View className="flex-row gap-2">
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
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                  />
                  <Pressable
                    onPress={addTime}
                    className="justify-center px-4 rounded-xl bg-[#038bbb] active:opacity-80"
                  >
                    <Text className="text-base font-semibold text-white">
                      Adicionar
                    </Text>
                  </Pressable>
                </View>
                {times.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    {times.map((time) => (
                      <Pressable
                        key={time}
                        onPress={() => setTimes(times.filter((t) => t !== time))}
                        className="flex-row items-center gap-1 bg-[#038bbb]/10 px-3 py-1.5 rounded-full"
                      >
                        <Text className="text-sm font-medium text-[#038bbb]">
                          {time}
                        </Text>
                        <MaterialCommunityIcons
                          name="close"
                          size={14}
                          color="#038bbb"
                        />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Dias da semana
                </Text>
                <View className="flex-row justify-between">
                  {WEEKDAYS.map((label, day) => (
                    <Pressable
                      key={label}
                      onPress={() => toggleDay(day)}
                      className={`w-10 h-10 items-center justify-center rounded-full border ${
                        days.includes(day)
                          ? "bg-[#038bbb] border-[#038bbb]"
                          : "border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          days.includes(day) ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Data de término (opcional)
                </Text>
                <TextInput
                  value={endDate}
                  onChangeText={(prev) => {
                    const cleaned = prev.replace(/[^0-9]/g, "").slice(0, 8);

                    let formatted = cleaned.slice(0, 2);
                    if (cleaned.length > 2) {
                      formatted = formatted + "/" + cleaned.slice(2, 4);
                    }
                    if (cleaned.length > 4) {
                      formatted = formatted + "/" + cleaned.slice(4, 8);
                    }
                    setEndDate(formatted);
                  }}
                  placeholder="Ex: 31/12/2026"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                />
              </View>

              <StockInput
                label="Estoque disponível (opcional)"
                value={stock}
                onChange={setStock}
              />
            </ScrollView>

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
