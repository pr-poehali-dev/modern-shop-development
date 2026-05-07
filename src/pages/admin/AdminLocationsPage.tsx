import { useEffect, useState, useCallback } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  working_hours: string;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  sort_order: number;
}

const empty: Omit<Location, "id"> = { name: "", address: "", city: "", phone: "", email: "", working_hours: "", lat: null, lng: null, is_active: true, sort_order: 0 };

export default function AdminLocationsPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Location> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${ADMIN_API_URL}?action=locations`, { headers: { "X-Admin-Token": token! } });
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    const method = modal.id ? "PUT" : "POST";
    await fetch(`${ADMIN_API_URL}?action=locations`, {
      method,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify(modal),
    });
    setSaving(false);
    setModal(null);
    load();
  };

  const deactivate = async (id: number) => {
    await fetch(`${ADMIN_API_URL}?action=locations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const fields = [
    { key: "name", label: "Название *" },
    { key: "city", label: "Город" },
    { key: "address", label: "Адрес" },
    { key: "phone", label: "Телефон" },
    { key: "email", label: "Email" },
    { key: "working_hours", label: "Часы работы" },
    { key: "lat", label: "Широта (lat)", type: "number" },
    { key: "lng", label: "Долгота (lng)", type: "number" },
    { key: "sort_order", label: "Порядок", type: "number" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Локации</h1>
        <button onClick={() => setModal({ ...empty })} className="flex items-center gap-2 px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors">
          <Icon name="Plus" size={16} /> Добавить
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Icon name="MapPin" size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Локаций нет. Добавьте первую!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map(loc => (
            <div key={loc.id} className={`bg-white rounded-2xl border p-4 flex items-start gap-4 ${loc.is_active ? "border-gray-100" : "border-gray-100 opacity-50"}`}>
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="MapPin" size={18} className="text-[#e31e24]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">{loc.name}</p>
                {loc.city && <p className="text-xs text-gray-500">{loc.city}</p>}
                {loc.address && <p className="text-xs text-gray-400">{loc.address}</p>}
                <div className="flex gap-3 mt-1 flex-wrap">
                  {loc.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Icon name="Phone" size={11} />{loc.phone}</span>}
                  {loc.working_hours && <span className="text-xs text-gray-500 flex items-center gap-1"><Icon name="Clock" size={11} />{loc.working_hours}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setModal({ ...loc })} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Icon name="Pencil" size={15} className="text-gray-500" />
                </button>
                <button onClick={() => deactivate(loc.id)} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                  <Icon name="Trash2" size={15} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">{modal.id ? "Редактировать" : "Новая локация"}</h2>
              <button onClick={() => setModal(null)}><Icon name="X" size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={String(modal[f.key as keyof typeof modal] ?? "")}
                    onChange={e => setModal({ ...modal, [f.key]: f.type === "number" && e.target.value ? Number(e.target.value) : e.target.value || null })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!modal.is_active} onChange={e => setModal({ ...modal, is_active: e.target.checked })} className="w-4 h-4 accent-[#e31e24]" />
                <span className="text-sm text-gray-700">Активна</span>
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
