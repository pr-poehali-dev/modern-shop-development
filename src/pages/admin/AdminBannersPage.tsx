import { useEffect, useState, useCallback } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  button_text: string;
  is_active: boolean;
  sort_order: number;
}

const empty: Omit<Banner, "id"> = { title: "", subtitle: "", image_url: "", link: "", button_text: "", is_active: true, sort_order: 0 };

export default function AdminBannersPage() {
  const { token } = useAdminAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Banner> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${ADMIN_API_URL}?action=banners`, { headers: { "X-Admin-Token": token! } });
    const data = await res.json();
    setBanners(data.items || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    const method = modal.id ? "PUT" : "POST";
    await fetch(`${ADMIN_API_URL}?action=banners`, {
      method,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify(modal),
    });
    setSaving(false);
    setModal(null);
    load();
  };

  const toggleActive = async (b: Banner) => {
    await fetch(`${ADMIN_API_URL}?action=banners`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ ...b, is_active: !b.is_active }),
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Баннеры</h1>
        <button onClick={() => setModal({ ...empty })} className="flex items-center gap-2 px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors">
          <Icon name="Plus" size={16} /> Добавить
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" /></div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Icon name="Image" size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Баннеров нет. Добавьте первый!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {banners.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 flex items-center gap-4 p-4">
              {b.image_url ? (
                <img src={b.image_url} alt="" className="w-24 h-14 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
              ) : (
                <div className="w-24 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Image" size={20} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">{b.title || "Без заголовка"}</p>
                <p className="text-xs text-gray-400 truncate">{b.subtitle}</p>
                {b.link && <p className="text-xs text-blue-500 truncate mt-0.5">{b.link}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">Порядок: {b.sort_order}</span>
                <button
                  onClick={() => toggleActive(b)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${b.is_active ? "bg-green-500" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${b.is_active ? "translate-x-4" : ""}`} />
                </button>
                <button onClick={() => setModal({ ...b })} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Icon name="Pencil" size={15} className="text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">{modal.id ? "Редактировать баннер" : "Новый баннер"}</h2>
              <button onClick={() => setModal(null)}><Icon name="X" size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: "title", label: "Заголовок" },
                { key: "subtitle", label: "Подзаголовок" },
                { key: "image_url", label: "URL изображения" },
                { key: "link", label: "Ссылка" },
                { key: "button_text", label: "Текст кнопки" },
                { key: "sort_order", label: "Порядок (число)", type: "number" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={String(modal[f.key as keyof typeof modal] ?? "")}
                    onChange={e => setModal({ ...modal, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!modal.is_active} onChange={e => setModal({ ...modal, is_active: e.target.checked })} className="w-4 h-4 accent-[#e31e24]" />
                <span className="text-sm text-gray-700">Активен</span>
              </label>
            </div>
            {modal.image_url && (
              <img src={modal.image_url} alt="" className="w-full h-28 object-cover rounded-xl mt-3 bg-gray-100" />
            )}
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
