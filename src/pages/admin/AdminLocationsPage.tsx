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

interface PmStore {
  id: number;
  name: string;
  main: boolean;
}

const emptyLoc: Omit<Location, "id"> = {
  name: "", address: "", city: "", phone: "", email: "",
  working_hours: "", lat: null, lng: null, is_active: true, sort_order: 0,
};

export default function AdminLocationsPage() {
  const { token } = useAdminAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [pmStores, setPmStores] = useState<PmStore[]>([]);
  const [byLocation, setByLocation] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);

  // Модалки
  const [locModal, setLocModal] = useState<Partial<Location> | null>(null);
  const [savingLoc, setSavingLoc] = useState(false);

  // Панель складов
  const [storesPanel, setStoresPanel] = useState<Location | null>(null);
  const [panelSelected, setPanelSelected] = useState<number[]>([]);
  const [savingStores, setSavingStores] = useState(false);
  const [savedStores, setSavedStores] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [locRes, storesRes, bindRes] = await Promise.all([
      fetch(`${ADMIN_API_URL}?action=locations`, { headers: { "X-Admin-Token": token! } }),
      fetch(`${ADMIN_API_URL}?action=promaster_stores`, { headers: { "X-Admin-Token": token! } }),
      fetch(`${ADMIN_API_URL}?action=location_stores`, { headers: { "X-Admin-Token": token! } }),
    ]);
    const locData = await locRes.json();
    const storesData = await storesRes.json();
    const bindData = await bindRes.json();

    setLocations(locData.items || []);
    setPmStores(storesData.items || []);

    const bl: Record<number, number[]> = {};
    const raw: Record<string, Array<{ store_id: number }>> = bindData.by_location || {};
    for (const [lid, stores] of Object.entries(raw)) {
      bl[Number(lid)] = stores.map((s) => s.store_id);
    }
    setByLocation(bl);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const saveLoc = async () => {
    if (!locModal?.name) return;
    setSavingLoc(true);
    const method = locModal.id ? "PUT" : "POST";
    await fetch(`${ADMIN_API_URL}?action=locations`, {
      method,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify(locModal),
    });
    setSavingLoc(false);
    setLocModal(null);
    load();
  };

  const deactivateLoc = async (id: number) => {
    await fetch(`${ADMIN_API_URL}?action=locations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const openStoresPanel = (loc: Location) => {
    setStoresPanel(loc);
    setPanelSelected(byLocation[loc.id] || []);
    setSavedStores(false);
  };

  const toggleStore = (sid: number) => {
    setPanelSelected(prev =>
      prev.includes(sid) ? prev.filter(i => i !== sid) : [...prev, sid]
    );
    setSavedStores(false);
  };

  const saveStores = async () => {
    if (!storesPanel) return;
    setSavingStores(true);
    const storeNames: Record<string, string> = {};
    panelSelected.forEach(sid => {
      const s = pmStores.find(s => s.id === sid);
      if (s) storeNames[String(sid)] = s.name;
    });
    await fetch(`${ADMIN_API_URL}?action=location_stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ location_id: storesPanel.id, store_ids: panelSelected, store_names: storeNames }),
    });
    setSavingStores(false);
    setSavedStores(true);
    setByLocation(prev => ({ ...prev, [storesPanel.id]: panelSelected }));
    setTimeout(() => setSavedStores(false), 2500);
  };

  const locFields = [
    { key: "name", label: "Название *" },
    { key: "city", label: "Город" },
    { key: "address", label: "Адрес" },
    { key: "phone", label: "Телефон" },
    { key: "email", label: "Email" },
    { key: "working_hours", label: "Часы работы" },
    { key: "sort_order", label: "Порядок сортировки", type: "number" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Локации</h1>
        <button
          onClick={() => setLocModal({ ...emptyLoc })}
          className="flex items-center gap-2 px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors"
        >
          <Icon name="Plus" size={16} /> Добавить локацию
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Локация — это географический регион (город/точка). К каждой локации можно привязать склады ProMaster,
        чьи остатки будут показаны покупателям в этом регионе.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Icon name="MapPin" size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium mb-1">Локаций нет</p>
          <p className="text-sm">Создайте первую локацию, чтобы привязать к ней склады</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {locations.map(loc => {
            const storeCount = (byLocation[loc.id] || []).length;
            return (
              <div
                key={loc.id}
                className={`bg-white rounded-2xl border p-4 flex items-start gap-4 ${loc.is_active ? "border-gray-100" : "border-gray-100 opacity-50"}`}
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="MapPin" size={18} className="text-[#e31e24]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{loc.name}</p>
                    {loc.city && <span className="text-xs text-gray-400">{loc.city}</span>}
                    {!loc.is_active && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Неактивна</span>}
                  </div>
                  {loc.address && <p className="text-xs text-gray-400 mt-0.5">{loc.address}</p>}
                  <div className="flex gap-3 mt-1.5 flex-wrap items-center">
                    {loc.phone && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Icon name="Phone" size={11} />{loc.phone}
                      </span>
                    )}
                    {loc.working_hours && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Icon name="Clock" size={11} />{loc.working_hours}
                      </span>
                    )}
                    <button
                      onClick={() => openStoresPanel(loc)}
                      className="flex items-center gap-1.5 text-xs text-[#e31e24] hover:underline ml-auto"
                    >
                      <Icon name="Warehouse" size={12} />
                      {storeCount > 0 ? `${storeCount} склад(ов)` : "Склады не привязаны"}
                      <Icon name="Settings" size={11} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setLocModal({ ...loc })}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Редактировать"
                  >
                    <Icon name="Pencil" size={15} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => deactivateLoc(loc.id)}
                    className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                    title="Деактивировать"
                  >
                    <Icon name="Trash2" size={15} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модалка создания/редактирования локации */}
      {locModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setLocModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">{locModal.id ? "Редактировать локацию" : "Новая локация"}</h2>
              <button onClick={() => setLocModal(null)}>
                <Icon name="X" size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              {locFields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={String(locModal[f.key as keyof typeof locModal] ?? "")}
                    onChange={e => setLocModal({
                      ...locModal,
                      [f.key]: f.type === "number" && e.target.value ? Number(e.target.value) : e.target.value || null,
                    })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!locModal.is_active}
                  onChange={e => setLocModal({ ...locModal, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#e31e24]"
                />
                <span className="text-sm text-gray-700">Активна</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setLocModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">
                Отмена
              </button>
              <button
                onClick={saveLoc}
                disabled={savingLoc || !locModal.name}
                className="flex-1 py-2.5 bg-[#e31e24] text-white rounded-xl text-sm hover:bg-[#c41920] transition-colors disabled:opacity-60"
              >
                {savingLoc ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Боковая панель привязки складов */}
      {storesPanel && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setStoresPanel(null)}>
          <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Склады локации</p>
                <p className="text-xs text-gray-400 mt-0.5">{storesPanel.name}</p>
              </div>
              <button onClick={() => setStoresPanel(null)}>
                <Icon name="X" size={18} className="text-gray-400" />
              </button>
            </div>

            <p className="text-xs text-gray-500 px-5 pt-3 pb-2">
              Отмеченные склады будут показаны покупателям в этом регионе.
            </p>

            {pmStores.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Склады из ProMaster не найдены
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-3 py-2">
                {pmStores.map(store => {
                  const selected = panelSelected.includes(store.id);
                  return (
                    <div
                      key={store.id}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors mb-1 ${selected ? "bg-red-50" : ""}`}
                      onClick={() => toggleStore(store.id)}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "bg-[#e31e24] border-[#e31e24]" : "border-gray-300"}`}>
                        {selected && <Icon name="Check" size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${selected ? "text-gray-900" : "text-gray-700"}`}>{store.name}</p>
                        <p className="text-xs text-gray-400">ID: {store.id}</p>
                      </div>
                      {store.main && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Осн.</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="px-4 pb-5 pt-3 border-t border-gray-100 space-y-2">
              {savedStores && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-3 py-2">
                  <Icon name="CheckCircle" size={15} /> Сохранено
                </div>
              )}
              <div className="flex gap-2">
                <span className="flex-1 text-xs text-gray-400 self-center">
                  Выбрано: {panelSelected.length} из {pmStores.length}
                </span>
                <button
                  onClick={saveStores}
                  disabled={savingStores}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors disabled:opacity-60"
                >
                  {savingStores ? "Сохраняем..." : <><Icon name="Save" size={15} /> Сохранить</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
