import { Pressable, Text, TextInput, View } from "react-native";

export type StockValue = {
  mode: "units" | "boxes";
  units: string;
  boxes: string;
  perBox: string;
};

export const EMPTY_STOCK: StockValue = {
  mode: "units",
  units: "",
  boxes: "",
  perBox: "",
};

// total em unidades; null quando nada foi preenchido
export function stockTotal(value: StockValue) {
  if (value.mode === "units") {
    return value.units ? Number(value.units) : null;
  }
  if (!value.boxes || !value.perBox) return null;
  return Number(value.boxes) * Number(value.perBox);
}

// no modo caixas, os dois campos precisam estar preenchidos (ou nenhum)
export function isStockIncomplete(value: StockValue) {
  return value.mode === "boxes" && !value.boxes !== !value.perBox;
}

function onlyDigits(text: string) {
  return text.replace(/[^0-9]/g, "").slice(0, 4);
}

interface StockInputProps {
  label: string;
  value: StockValue;
  onChange: (value: StockValue) => void;
}

const INPUT_CLASS =
  "border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900";

export default function StockInput({ label, value, onChange }: StockInputProps) {
  const total = stockTotal(value);

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      <View className="flex-row gap-2 mb-2">
        {(["units", "boxes"] as const).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => onChange({ ...value, mode })}
            className={`flex-1 items-center py-2 rounded-xl border ${
              value.mode === mode
                ? "bg-[#038bbb] border-[#038bbb]"
                : "border-gray-300"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                value.mode === mode ? "text-white" : "text-gray-700"
              }`}
            >
              {mode === "units" ? "Unidades" : "Caixas"}
            </Text>
          </Pressable>
        ))}
      </View>

      {value.mode === "units" ? (
        <TextInput
          value={value.units}
          onChangeText={(text) =>
            onChange({ ...value, units: onlyDigits(text) })
          }
          placeholder="Ex: 30 unidades"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          className={INPUT_CLASS}
        />
      ) : (
        <>
          <View className="flex-row gap-2">
            <TextInput
              value={value.boxes}
              onChangeText={(text) =>
                onChange({ ...value, boxes: onlyDigits(text) })
              }
              placeholder="Nº de caixas"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              className={`flex-1 ${INPUT_CLASS}`}
            />
            <TextInput
              value={value.perBox}
              onChangeText={(text) =>
                onChange({ ...value, perBox: onlyDigits(text) })
              }
              placeholder="Unidades por caixa"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              className={`flex-1 ${INPUT_CLASS}`}
            />
          </View>
          {total !== null && (
            <Text className="text-sm text-gray-500 mt-1.5">
              Total: {total} unidade(s)
            </Text>
          )}
        </>
      )}
    </View>
  );
}
