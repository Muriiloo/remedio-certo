import { useAuth } from "@/hooks/useAuth";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, PropsWithChildren, useCallback, useState } from "react";

export type Remedy = {
  id: number;
  name: string;
  quantity: number;
  time_to_take: string;
  person_id: number;
};

type RemedyState = {
  remedy: Remedy[]
  loadRemedies: () => Promise<void>
}

export const RemedyContext = createContext<RemedyState>({} as RemedyState)

export function RemedyProvider({children} : PropsWithChildren) {
  const [remedy, setRemedy] = useState<Remedy[]>([]);
  const { loggedUser } = useAuth();
  const db = useSQLiteContext();  

  const loadRemedies = useCallback(async () => {
      if (!loggedUser) return;
  
      const result = await db.getAllAsync<Remedy>(
        "SELECT id, name, quantity, time_to_take FROM remedy WHERE person_id = ? ORDER BY time_to_take",
        [loggedUser.id],
      );
      setRemedy(result);
    }, [db, loggedUser]);

  return (
    <RemedyContext.Provider value={{ remedy, loadRemedies}}>
      {children}
    </RemedyContext.Provider>
  )
}