import { useEffect, useState, useCallback } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLES = ["admin", "superadmin", "manager"];

export default function AdminUsersPage() {
  const { token, user: me } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<AdminUser & { password: string }> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${ADMIN_API_URL}?action=users`, { headers: { "X-Admin-Token": token! } });
    const data = await res.json();
    setUsers(data.items || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    setError("");
    const method = modal.id ? "PUT" : "POST";
    const res = await fetch(`${ADMIN_API_URL}?action=users`, {
      method,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify(modal),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    setModal(null);
    load();
  };

  const toggleActive = async (u: AdminUser) => {
    if (u.id === me?.id) return;
    await fetch(`${ADMIN_API_URL}?action=users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ id: u.id, is_active: !u.is_active }),
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Пользователи</h1>
        <button onClick={() => setModal({ name: "", email: "", password: "", role: "admin", is_active: true })} className="flex items-center gap-2 px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors">
          <Icon name="Plus" size={16} /> Добавить
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Имя</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Email</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Роль</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Создан</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                      {u.id === me?.id && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Вы</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === "superadmin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString("ru")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={u.id === me?.id}
                      className={`relative w-10 h-6 rounded-full transition-colors disabled:opacity-50 ${u.is_active ? "bg-green-500" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${u.is_active ? "translate-x-4" : ""}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setModal({ ...u, password: "" })} className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Icon name="Pencil" size={14} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">{modal.id ? "Редактировать" : "Новый пользователь"}</h2>
              <button onClick={() => setModal(null)}><Icon name="X" size={18} className="text-gray-400" /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-xl mb-3">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Имя *</label>
                <input value={modal.name || ""} onChange={e => setModal({ ...modal, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email *</label>
                <input type="email" value={modal.email || ""} onChange={e => setModal({ ...modal, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{modal.id ? "Новый пароль (оставьте пустым чтобы не менять)" : "Пароль *"}</label>
                <input type="password" value={modal.password || ""} onChange={e => setModal({ ...modal, password: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Роль</label>
                <select value={modal.role || "admin"} onChange={e => setModal({ ...modal, role: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!modal.is_active} onChange={e => setModal({ ...modal, is_active: e.target.checked })} className="w-4 h-4 accent-[#e31e24]" />
                <span className="text-sm text-gray-700">Активен</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Отмена</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-[#e31e24] text-white rounded-xl text-sm hover:bg-[#c41920] transition-colors disabled:opacity-60">
                {saving ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
