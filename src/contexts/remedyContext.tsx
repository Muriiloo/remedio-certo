import {
  getRemedies,
  getTakenDoses,
  isLowStock,
  takeDose as registerDose,
  type Remedy,
} from "@/database/remedies";
import { dateKey, dosesFor, type Dose } from "@/helpers/schedule";
import { useAuth } from "@/hooks/useAuth";
import {
  cancelSnooze,
  handleNotificationResponse,
  syncMedicationNotifications,
} from "@/services/notifications";
import { openNearbyPharmacies } from "@/services/pharmacies";
import * as Notifications from "expo-notifications";
import { useSQLiteContext } from "expo-sqlite";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";

export type { Remedy };

type RemedyState = {
  remedy: Remedy[];
  // doses previstas para hoje, em ordem de horário
  doses: Dose[];
  loadRemedies: () => Promise<void>;
  takeDose: (dose: Dose) => Promise<void>;
};

export const RemedyContext = createContext<RemedyState>({} as RemedyState);

export function RemedyProvider({ children }: PropsWithChildren) {
  const [remedy, setRemedy] = useState<Remedy[]>([]);
  const [doses, setDoses] = useState<Dose[]>([]);
  const { loggedUser } = useAuth();
  const db = useSQLiteContext();

  const loadRemedies = useCallback(async () => {
    if (!loggedUser) return;

    const today = new Date();
    const [remedies, taken] = await Promise.all([
      getRemedies(db, loggedUser.id),
      getTakenDoses(db, dateKey(today)),
    ]);
    setRemedy(remedies);
    setDoses(dosesFor(remedies, today, taken));
  }, [db, loggedUser]);

  async function takeDose(dose: Dose) {
    const updated = await registerDose(
      db,
      dose.remedyId,
      dateKey(new Date()),
      dose.time,
    );
    await cancelSnooze(dose.remedyId, dose.time);
    await loadRemedies();

    if (updated && isLowStock(updated)) {
      Alert.alert(
        "Estoque baixo",
        `Restam ${updated.stock} unidade(s) de ${updated.name}.`,
        [
          { text: "Agora não", style: "cancel" },
          { text: "Ver farmácias", onPress: () => openNearbyPharmacies() },
        ],
      );
    }
  }

  useEffect(() => {
    syncMedicationNotifications(db).catch((error) =>
      console.error("Error syncing notifications:", error),
    );
  }, [db]);

  // botões da notificação tocados com o app aberto ou em segundo plano
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        await handleNotificationResponse(response);
        await loadRemedies();
      },
    );

    return () => subscription.remove();
  }, [loadRemedies]);

  return (
    <RemedyContext.Provider value={{ remedy, doses, loadRemedies, takeDose }}>
      {children}
    </RemedyContext.Provider>
  );
}
