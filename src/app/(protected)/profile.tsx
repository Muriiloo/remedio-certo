import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { loggedUser, signOut, updateEmergencyContact } = useAuth();
  const [contactName, setContactName] = useState(
    loggedUser?.emergency_name ?? "",
  );
  const [contactPhone, setContactPhone] = useState(
    loggedUser?.emergency_phone ?? "",
  );

  async function handleSave() {
    const digits = contactPhone.replace(/[^0-9]/g, "");
    if (contactPhone.trim() && digits.length < 10) {
      Alert.alert("Erro", "Informe o telefone com DDD.");
      return;
    }

    try {
      await updateEmergencyContact(contactName, contactPhone);
      Alert.alert("Pronto", "Contato de emergência salvo.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o contato.");
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#038bbb]">
      <View className="p-6">
        <View className="flex-row items-center gap-3">
          <Ionicons name="person-circle-outline" size={40} color="white" />
          <View>
            <Text className="text-white text-4xl font-medium">
              {loggedUser?.name}
            </Text>
            <Text className="text-white text-lg">{loggedUser?.age} anos</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-[#ebe7e0] rounded-t-3xl"
      >
        <ScrollView
          contentContainerClassName="p-6 gap-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-white rounded-xl p-6 gap-4">
            <View>
              <Text className="text-xl font-semibold text-gray-900">
                Contato de emergência
              </Text>
              <Text className="text-sm text-gray-500">
                Quando uma dose atrasar mais de 30 minutos, a tela inicial
                oferece um atalho para avisar essa pessoa.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Nome
              </Text>
              <TextInput
                value={contactName}
                onChangeText={setContactName}
                placeholder="Ex: Maria (filha)"
                placeholderTextColor="#9ca3af"
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Telefone com DDD
              </Text>
              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Ex: (11) 91234-5678"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
              />
            </View>

            <Pressable
              onPress={handleSave}
              className="items-center py-3.5 rounded-xl bg-[#038bbb] active:opacity-80"
            >
              <Text className="text-base font-semibold text-white">Salvar</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={signOut}
            className="flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-red-400 bg-white active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={22} color="#dc2626" />
            <Text className="text-base font-semibold text-red-600">Sair</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
