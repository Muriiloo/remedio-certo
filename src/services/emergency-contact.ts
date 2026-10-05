import * as Linking from "expo-linking";
import { Alert } from "react-native";

function onlyDigits(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

export async function sendWhatsApp(phone: string, message: string) {
  let digits = onlyDigits(phone);
  // número sem código do país: assume Brasil
  if (digits.length <= 11) digits = `55${digits}`;

  try {
    await Linking.openURL(
      `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
    );
  } catch (error) {
    Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
  }
}

export async function sendSms(phone: string, message: string) {
  try {
    await Linking.openURL(
      `sms:${onlyDigits(phone)}?body=${encodeURIComponent(message)}`,
    );
  } catch (error) {
    Alert.alert("Erro", "Não foi possível abrir o app de mensagens.");
  }
}
