import { createContext, useContext, useState, type ReactNode } from "react";
import { apiFetch, setToken, clearToken, getToken } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  full_name?: string | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithEmail:  (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signUpWithEmail:  (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem("vendorhub_user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(u: User) {
  localStorage.setItem("vendorhub_user", JSON.stringify(u));
}

function removeUser() {
  localStorage.removeItem("vendorhub_user");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Restore session from localStorage if token still exists
    return getToken() ? loadUser() : null;
  });

  async function signInWithEmail(email: string, password: string): Promise<{ error: Error | null }> {
    try {
      const data = await apiFetch<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      saveUser(data.user);
      setUser(data.user);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async function signUpWithEmail(email: string, password: string, fullName?: string): Promise<{ error: Error | null }> {
    try {
      const data = await apiFetch<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      setToken(data.token);
      saveUser(data.user);
      setUser(data.user);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  // Google OAuth not implemented in backend — uses demo login
  async function signInWithGoogle(): Promise<{ error: Error | null }> {
    return signInWithEmail("admin@vendorhub.io", "admin123");
  }

  async function signOut(): Promise<void> {
    clearToken();
    removeUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading: false, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
