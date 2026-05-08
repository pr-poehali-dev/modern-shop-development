import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const AUTH_URL = "https://functions.poehali.dev/382b85d9-e653-4b8a-8ba9-eb8f96548e2a";
const TOKEN_KEY = "sc_user_token";
const USER_CACHE_KEY = "sc_user_cache";
const USER_CACHE_TTL = 30 * 60_000; // 30 минут

function getCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < USER_CACHE_TTL) return data as User;
  } catch (e) { void e; }
  return null;
}
function setCachedUser(user: User) {
  try { localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ data: user, ts: Date.now() })); } catch (e) { void e; }
}
function clearCachedUser() {
  try { localStorage.removeItem(USER_CACHE_KEY); } catch (e) { void e; }
}

interface User {
  id: number;
  name: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (name: string, phone: string) => Promise<{ error?: string }>;
  login: (phone: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCachedUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(() => !getCachedUser() && !!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) { setLoading(false); return; }
    // Если есть свежий кеш — не идём на сервер
    if (getCachedUser()) { setLoading(false); return; }
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": savedToken },
      body: JSON.stringify({ action: "profile" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) { setUser(data.user); setToken(savedToken); setCachedUser(data.user); }
        else { localStorage.removeItem(TOKEN_KEY); clearCachedUser(); setToken(null); }
      })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); clearCachedUser(); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const register = async (name: string, phone: string) => {
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", name, phone }),
    });
    const data = await res.json();
    if (data.error) return { error: data.error };
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setCachedUser(data.user);
    return {};
  };

  const login = async (phone: string) => {
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", phone }),
    });
    const data = await res.json();
    if (data.error) return { error: data.error };
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setCachedUser(data.user);
    return {};
  };

  const logout = () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": t },
        body: JSON.stringify({ action: "logout" }),
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    clearCachedUser();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}