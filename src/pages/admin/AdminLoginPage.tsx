import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

export default function AdminLoginPage() {
  const { user, login, loading } = useAdminAuth();
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const err = await login(email, password);
    if (err) setError(err);
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-[#e31e24] rounded-2xl flex items-center justify-center">
            <Icon name="Zap" size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-white text-2xl font-bold text-center mb-1">Вход в панель</h1>
        <p className="text-white/40 text-sm text-center mb-8">ServiceClick Admin</p>

        <form onSubmit={handleSubmit} className="bg-white/5 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <div>
            <label className="block text-white/60 text-xs mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#e31e24] placeholder:text-white/30"
              placeholder="admin@admin.com"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1.5">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#e31e24] placeholder:text-white/30"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#e31e24] hover:bg-[#c41920] text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {busy ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
