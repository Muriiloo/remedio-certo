import { useSQLiteContext } from "expo-sqlite";
import { createContext, PropsWithChildren, useState } from "react";

type AuthState = {
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: (name: string, password: string) => Promise<void>;
  signOut: () => void;
};

export const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function signIn(name: string, password: string) {
    setIsLoading(true);

    try {
      const user = await db.getFirstAsync<{ id: number; password: string }>(
        "SELECT id, name, password FROM person WHERE name = ? AND password = ?",
        [name, password],
      );

      if (!user) {
        throw new Error("Usuário ou senha inválidos.");
      }

      setIsLoggedIn(true);
    } finally {
      setIsLoading(false);
    }
  }

  function signOut() {
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ signIn, isLoggedIn, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
