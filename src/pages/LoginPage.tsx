import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickFooter from "@/components/ServiceclickFooter";
import Icon from "@/components/ui/icon";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    let result = "+7";
    if (digits.length > 1) result += " (" + digits.slice(1, 4);
    if (digits.length >= 4) result += ") " + digits.slice(4, 7);
    if (digits.length >= 7) result += "-" + digits.slice(7, 9);
    if (digits.length >= 9) result += "-" + digits.slice(9, 11);
    return result;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const normalized = raw.startsWith("8") ? "7" + raw.slice(1) : raw.startsWith("7") ? raw : "7" + raw;
    setPhone(formatPhone(normalized));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const rawPhone = phone.replace(/\D/g, "");
      if (rawPhone.length < 11) { setError("Введите корректный номер телефона"); return; }
      let result;
      if (mode === "register") {
        if (!name.trim()) { setError("Введите ваше имя"); return; }
        result = await register(name.trim(), phone);
      } else {
        result = await login(phone);
      }
      if (result.error) { setError(result.error); return; }
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <ServiceclickHeader />
      <ServiceclickNav />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#e31e24] rounded-xl flex items-center justify-center">
              <Icon name="User" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {mode === "login" ? "Войти" : "Регистрация"}
              </h1>
              <p className="text-xs text-gray-400">Для оформления заказов</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Ваше имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e31e24] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Телефон</label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e31e24] transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <Icon name="AlertCircle" size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e31e24] hover:bg-[#c41920] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? "Подождите..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>

          <div className="mt-4 text-center">
            {mode === "login" ? (
              <p className="text-sm text-gray-500">
                Нет аккаунта?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-[#e31e24] hover:underline font-medium">
                  Зарегистрироваться
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Уже есть аккаунт?{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-[#e31e24] hover:underline font-medium">
                  Войти
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
      <ServiceclickFooter />
    </div>
  );
}
