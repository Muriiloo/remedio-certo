import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
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

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");

  async function handleSignUp() {
    if (
      !name.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !age.trim()
    ) {
      setError("Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    const ageNumber = Number(age);

    try {
      await signUp(name, password, ageNumber);
      router.replace("/sign-in");
    } catch (error) {
      Alert.alert("Erro", (error as Error).message);
    }
  }

  return (
    <SafeAreaView edges={["bottom", "top"]} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-10">
            <Text className="text-3xl font-bold text-gray-900">Cadastrar</Text>
            <Text className="mt-2 text-base text-gray-500">
              Crie sua conta para continuar
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Usuário
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Digite seu usuário"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                className="rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Idade
              </Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Digite sua idade"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                className="rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Senha
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                className="rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Confirmar senha
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                className="rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900"
              />
            </View>

            {error && <Text className="text-sm text-red-500">{error}</Text>}

            <Pressable
              className="mt-2 items-center rounded-xl bg-blue-600 py-3.5 active:opacity-80 disabled:opacity-60"
              onPress={handleSignUp}
            >
              <Text className="text-base font-semibold text-white">
                Cadastrar
              </Text>
            </Pressable>
          </View>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-gray-500">Já tem uma conta? </Text>
            <Pressable onPress={() => router.push("/sign-in")}>
              <Text className="font-semibold text-blue-600">Faça o login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
