import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    if (!name.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await signIn(name, password);
      router.replace("/");
    } catch (err) {
      setError("Usuário ou senha inválidos.");
    } finally {
      setIsSubmitting(false);
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
            <Text className="text-3xl font-bold text-gray-900">Entrar</Text>
            <Text className="mt-2 text-base text-gray-500">
              Acesse sua conta para continuar
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

            {error && <Text className="text-sm text-red-500">{error}</Text>}

            <Pressable
              onPress={handleSignIn}
              disabled={isSubmitting}
              className="mt-2 items-center rounded-xl bg-blue-600 py-3.5 active:opacity-80 disabled:opacity-60"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Entrar
                </Text>
              )}
            </Pressable>
          </View>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-gray-500">Não tem uma conta? </Text>
            <Pressable onPress={() => router.push("/sign-up")}>
              <Text className="font-semibold text-blue-600">Cadastre-se</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
