import { useEffect, useState, useCallback } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

interface Warehouse {
  id: number;
  external_id: string;
  name: string;
  location_id: number | null;
  address: string;
  is_main: boolean;
  is_active: boolean;
}

interface Location {
  id: number;
  name: string;
}

const empty: Omit<Warehouse, "id"> = { external_id: "", name: "", location_id: null, address: "", is_main: false, is_active: true };

export default function AdminWarehousesPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Warehouse> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [wRes, lRes] = await Promise.all([
      fetch(`${ADMIN_API_URL}?action=warehouses`, { headers: { "X-Admin-Token": token! } }),
      fetch(`${ADMIN_API_URL}?action=locations`, { headers: { "X-Admin-Token": token! } }),
    ]);
    const wData = await wRes.json();
    const lData = await lRes.json();
    setItems(wData.items || []);
    setLocations(lData.items || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    const method = modal.id ? "PUT" : "POST";
    await fetch(`${ADMIN_API_URL}?action=warehouses`, {
      method,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify(modal),
    });
    setSaving(false);
    setModal(null);
    load();
  };

  const deactivate = async (id: number) => {
    await fetch(`${ADMIN_API_URL}?action=warehouses`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const getLocation = (id: number | null) => locations.find(l => l.id === id)?.name || "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Склады</h1>
        <button onClick={() => setModal({ ...empty })} className="flex items-center gap-2 px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors">
          <Icon name="Plus" size={16} /> Добавить
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Icon name="Warehouse" size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Складов нет. Добавьте первый!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Название</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Внешний ID</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Локация</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Адрес</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Главный</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(w => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{w.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{w.external_id || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{getLocation(w.location_id)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{w.address || "—"}</td>
                  <td className="px-4 py-3">{w.is_main && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Да</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${w.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {w.is_active ? "Активен" : "Откл."}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setModal({ ...w })} className="p-1.5 hover:bg-gray-100 rounded-lg"><Icon name="Pencil" size={14} className="text-gray-400" /></button>
                      <button onClick={() => deactivate(w.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Icon name="Trash2" size={14} className="text-red-400" /></button>
                    </div>
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
              <h2 className="font-bold text-gray-900">{modal.id ? "Редактировать склад" : "Новый склад"}</h2>
              <button onClick={() => setModal(null)}><Icon name="X" size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              {[{ key: "name", label: "Название *" }, { key: "external_id", label: "Внешний ID (из ProMaster)" }, { key: "address", label: "Адрес" }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    value={String(modal[f.key as keyof typeof modal] ?? "")}
                    onChange={e => setModal({ ...modal, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Локация</label>
                <select
                  value={String(modal.location_id ?? "")}
                  onChange={e => setModal({ ...modal, location_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                >
                  <option value="">Не выбрана</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!modal.is_main} onChange={e => setModal({ ...modal, is_main: e.target.checked })} className="w-4 h-4 accent-[#e31e24]" />
                  <span className="text-sm text-gray-700">Главный склад</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!modal.is_active} onChange={e => setModal({ ...modal, is_active: e.target.checked })} className="w-4 h-4 accent-[#e31e24]" />
                  <span className="text-sm text-gray-700">Активен</span>
                </label>
              </div>
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
