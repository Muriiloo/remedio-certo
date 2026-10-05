import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { Alert, Platform } from "react-native";

const SEARCH_TERM = encodeURIComponent("farmácia");

export async function openNearbyPharmacies() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Aviso",
      "Sem permissão de localização. Ative nas configurações do aparelho para ver as farmácias perto de você.",
    );
    return;
  }

  let coords: Location.LocationObjectCoords;
  try {
    // a última posição conhecida é instantânea; só consulto o GPS se não houver
    const position =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }));
    coords = position.coords;
  } catch (error) {
    Alert.alert(
      "Erro",
      "Não foi possível obter sua localização. Verifique se o GPS está ativado.",
    );
    return;
  }

  const { latitude, longitude } = coords;
  const webUrl = `https://www.google.com/maps/search/${SEARCH_TERM}/@${latitude},${longitude},15z`;

  try {
    if (Platform.OS === "android") {
      // abre direto o app de mapas do aparelho
      await Linking.openURL(`geo:${latitude},${longitude}?q=${SEARCH_TERM}`);
      return;
    }
    await Linking.openURL(webUrl);
  } catch (error) {
    try {
      await Linking.openURL(webUrl);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o mapa.");
    }
  }
}
