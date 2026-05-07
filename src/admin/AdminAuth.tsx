import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const ADMIN_API = "https://functions.poehali.dev/58efb070-a53e-4380-88c5-6f0f16480430";
const TOKEN_KEY = "admin_token";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthCtx {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      fetch(`${ADMIN_API}?action=me`, { headers: { "X-Admin-Token": saved } })
        .then((r) => r.json())
        .then((data) => {
          if (data.id) { setUser(data); setToken(saved); }
          else localStorage.removeItem(TOKEN_KEY);
        })
        .catch(() => localStorage.removeItem(TOKEN_KEY))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const res = await fetch(`${ADMIN_API}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return null;
    }
    return data.error || "Ошибка входа";
  };

  const logout = () => {
    if (token) {
      fetch(`${ADMIN_API}?action=logout`, { headers: { "X-Admin-Token": token } });
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AuthContext);
export const ADMIN_API_URL = ADMIN_API;
