import { router } from "expo-router";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { Platform } from "react-native";

// Nominatim: a busca oficial do OpenStreetMap (limite de 1 requisição/segundo)
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// o Nominatim recusa requisições sem um User-Agent que identifique o app
const USER_AGENT = "RemedioCerto/1.0 (app de lembrete de remedios)";

const SEARCH_RADIUS_METERS = 3000;
const MAX_RESULTS = 30;
const REQUEST_TIMEOUT_MS = 12000;

export type Pharmacy = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  openingHours: string | null;
  latitude: number;
  longitude: number;
  distanceMeters: number;
};

export type PharmaciesErrorCode = "permission" | "location" | "network";

export class PharmaciesError extends Error {
  constructor(public code: PharmaciesErrorCode) {
    super(code);
  }
}

// abre a tela com a lista de farmácias próximas
export function openNearbyPharmacies() {
  router.push("/pharmacies");
}

export async function getUserCoords() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new PharmaciesError("permission");

  try {
    // a última posição conhecida é instantânea; só consulto o GPS se não houver
    const position =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }));
    return position.coords;
  } catch {
    throw new PharmaciesError("location");
  }
}

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type NominatimResult = {
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  name?: string;
  address?: Record<string, string>;
  extratags?: Record<string, string>;
};

async function searchNominatim(
  latitude: number,
  longitude: number,
): Promise<Omit<Pharmacy, "distanceMeters">[]> {
  // caixa de busca ao redor do usuário (esquerda, topo, direita, base)
  const dLat = SEARCH_RADIUS_METERS / 111320;
  const dLon = dLat / Math.cos((latitude * Math.PI) / 180);
  const viewbox = [
    longitude - dLon,
    latitude + dLat,
    longitude + dLon,
    latitude - dLat,
  ].join(",");

  const params = new URLSearchParams({
    q: "farmacia",
    format: "jsonv2",
    limit: String(MAX_RESULTS),
    bounded: "1",
    viewbox,
    addressdetails: "1",
    extratags: "1",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let results: NominatimResult[];
  try {
    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Nominatim ${response.status}`);
    results = await response.json();
  } finally {
    clearTimeout(timer);
  }

  return results.map((item) => {
    const address = item.address ?? {};
    const tags = item.extratags ?? {};
    const street = [address.road, address.house_number]
      .filter(Boolean)
      .join(", ");
    const parts = [
      street,
      address.suburb ?? address.neighbourhood,
      address.city ?? address.town,
    ].filter(Boolean);

    return {
      id: `${item.osm_type}-${item.osm_id}`,
      name: item.name || "Farmácia",
      address: parts.length > 0 ? parts.join(" - ") : null,
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      openingHours: tags.opening_hours ?? null,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    };
  });
}

export async function fetchNearbyPharmacies(
  latitude: number,
  longitude: number,
): Promise<Pharmacy[]> {
  let found: Awaited<ReturnType<typeof searchNominatim>>;
  try {
    found = await searchNominatim(latitude, longitude);
  } catch (error) {
    console.warn("Nominatim falhou:", error);
    throw new PharmaciesError("network");
  }

  return found
    .map((pharmacy) => ({
      ...pharmacy,
      distanceMeters: distanceInMeters(
        latitude,
        longitude,
        pharmacy.latitude,
        pharmacy.longitude,
      ),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, MAX_RESULTS);
}

export function formatDistance(meters: number) {
  return meters < 1000
    ? `${Math.round(meters / 10) * 10} m`
    : `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

export async function openInMaps(pharmacy: Pharmacy) {
  const { latitude, longitude, name } = pharmacy;
  const label = encodeURIComponent(name);
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  try {
    if (Platform.OS === "android") {
      await Linking.openURL(`geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`);
      return;
    }
    await Linking.openURL(webUrl);
  } catch {
    await Linking.openURL(webUrl);
  }
}

export function callPharmacy(phone: string) {
  return Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`);
}
