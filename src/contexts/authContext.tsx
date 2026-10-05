import { useSQLiteContext } from "expo-sqlite";
import { createContext, PropsWithChildren, useState } from "react";

type User = {
  id: number;
  name: string;
  age: number;
  emergency_name: string | null;
  emergency_phone: string | null;
};

type AuthState = {
  updateEmergencyContact: (name: string, phone: string) => Promise<void>;
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: (name: string, password: string) => Promise<void>;
  signUp: (name: string, password: string, age: number) => Promise<void>;
  signOut: () => void;
  loggedUser: User | null;
};

export const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);

  async function signIn(name: string, password: string) {
    setIsLoading(true);

    try {
      const user = await db.getFirstAsync<User>(
        "SELECT id, name, age, emergency_name, emergency_phone FROM person WHERE name = ? AND password = ?",
        [name, password],
      );

      if (!user) {
        throw new Error("Usuário ou senha inválidos.");
      }

      setIsLoggedIn(true);
      setLoggedUser(user);
    } finally {
      setIsLoading(false);
    }
  }

  function signOut() {
    setIsLoggedIn(false);
    setLoggedUser(null);
  }

  async function updateEmergencyContact(name: string, phone: string) {
    if (!loggedUser) return;

    const emergency_name = name.trim() || null;
    const emergency_phone = phone.trim() || null;

    await db.runAsync(
      "UPDATE person SET emergency_name = ?, emergency_phone = ? WHERE id = ?",
      [emergency_name, emergency_phone, loggedUser.id],
    );
    setLoggedUser({ ...loggedUser, emergency_name, emergency_phone });
  }

  async function signUp(name: string, password: string, age: number) {
    setIsLoading(true);

    try {
      const existing = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM person WHERE name = ?",
        [name],
      );

      if (existing) {
        throw new Error("Nome de usuário já existe.");
      }

      await db.runAsync(
        `INSERT INTO person (name, password, age) VALUES (?, ?, ?)`,
        [name, password, age],
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signIn,
        loggedUser,
        isLoggedIn,
        isLoading,
        signOut,
        signUp,
        updateEmergencyContact,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
