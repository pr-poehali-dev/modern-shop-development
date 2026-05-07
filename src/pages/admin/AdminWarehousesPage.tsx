import { useEffect, useState, useCallback } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

interface PmStore {
  id: number;
  name: string;
  main: boolean;
}

export default function AdminWarehousesPage() {
  const { token } = useAdminAuth();
  const [stores, setStores] = useState<PmStore[]>([]);
  const [visibleIds, setVisibleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [storesRes, visRes] = await Promise.all([
      fetch(`${ADMIN_API_URL}?action=promaster_stores`, { headers: { "X-Admin-Token": token! } }),
      fetch(`${ADMIN_API_URL}?action=shop_warehouses`, { headers: { "X-Admin-Token": token! } }),
    ]);
    const storesData = await storesRes.json();
    const visData = await visRes.json();
    setStores(storesData.items || []);
    setVisibleIds(visData.store_ids || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const toggle = (id: number) => {
    setVisibleIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const selectAll = () => {
    setVisibleIds(stores.map(s => s.id));
    setSaved(false);
  };

  const selectNone = () => {
    setVisibleIds([]);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    await fetch(`${ADMIN_API_URL}?action=shop_warehouses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ store_ids: visibleIds }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Склады</h1>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors disabled:opacity-60"
        >
          {saved
            ? <><Icon name="Check" size={16} /> Сохранено</>
            : saving
            ? "Сохраняем..."
            : <><Icon name="Save" size={16} /> Сохранить</>
          }
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Выберите склады ProMaster, остатки которых будут отображаться в интернет-магазине.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" />
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Icon name="Warehouse" size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Склады не найдены в ProMaster</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            <button onClick={selectAll} className="text-xs text-[#e31e24] hover:underline">Выбрать все</button>
            <span className="text-gray-300">·</span>
            <button onClick={selectNone} className="text-xs text-gray-400 hover:underline">Снять все</button>
            <span className="ml-auto text-xs text-gray-400">
              {visibleIds.length} из {stores.length} выбрано
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {stores.map((store, idx) => {
              const isVisible = visibleIds.includes(store.id);
              return (
                <div
                  key={store.id}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${idx > 0 ? "border-t border-gray-100" : ""}`}
                  onClick={() => toggle(store.id)}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isVisible ? "bg-[#e31e24] border-[#e31e24]" : "border-gray-300"}`}>
                    {isVisible && <Icon name="Check" size={12} className="text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{store.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ID: {store.id}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {store.main && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Основной</span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {isVisible ? "Показывать" : "Скрыт"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {saved && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
              <Icon name="CheckCircle" size={16} />
              Настройки сохранены. Каталог будет показывать только выбранные склады.
            </div>
          )}
        </>
      )}
    </div>
  );
}
