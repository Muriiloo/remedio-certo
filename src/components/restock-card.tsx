import StockInput, {
  EMPTY_STOCK,
  isStockIncomplete,
  stockTotal,
} from "@/components/stock-input";
import { addStock, type Remedy } from "@/database/remedies";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

interface RestockCardProps {
  remedy: Remedy | null;
  onClose: () => void;
  onRestocked: () => Promise<void>;
}

export default function RestockCard({
  remedy,
  onClose,
  onRestocked,
}: RestockCardProps) {
  const [stock, setStock] = useState(EMPTY_STOCK);
  const db = useSQLiteContext();

  function handleClose() {
    setStock(EMPTY_STOCK);
    onClose();
  }

  async function handleSave() {
    if (!remedy) return;

    const total = stockTotal(stock);
    if (isStockIncomplete(stock) || !total) {
      Alert.alert("Erro", "Informe quantas unidades foram compradas.");
      return;
    }

    try {
      await addStock(db, remedy.id, total);
      await onRestocked();
      handleClose();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o estoque.");
    }
  }

  return (
    <Modal
      onRequestClose={handleClose}
      visible={remedy !== null}
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
          onPress={handleClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6"
          >
            <Text className="text-xl font-semibold text-gray-900">
              Repor estoque
            </Text>
            <Text className="text-base text-gray-500 mb-6">
              {remedy?.name} - {remedy?.stock ?? 0} unidade(s) em estoque
            </Text>

            <StockInput
              label="Quantidade comprada"
              value={stock}
              onChange={setStock}
            />

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={handleClose}
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
