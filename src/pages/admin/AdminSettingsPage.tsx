import { useEffect, useState, useCallback } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

interface Setting {
  key: string;
  value: string;
  label: string;
  group: string;
}

const GROUP_LABELS: Record<string, string> = {
  general: "Основные",
  delivery: "Доставка",
  seo: "SEO",
};

export default function AdminSettingsPage() {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${ADMIN_API_URL}?action=settings`, { headers: { "X-Admin-Token": token! } });
    const data = await res.json();
    setSettings(data.items || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const update = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const save = async () => {
    setSaving(true);
    await fetch(`${ADMIN_API_URL}?action=settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ items: settings }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const groups = [...new Set(settings.map(s => s.group))];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Настройки магазина</h1>
        <button onClick={save} disabled={saving || loading} className="flex items-center gap-2 px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors disabled:opacity-60">
          {saved ? <><Icon name="Check" size={16} /> Сохранено!</> : <><Icon name="Save" size={16} /> {saving ? "Сохраняем..." : "Сохранить"}</>}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-700 text-sm">{GROUP_LABELS[group] || group}</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {settings.filter(s => s.group === group).map(s => (
                  <div key={s.key} className="px-5 py-3 flex items-center gap-4">
                    <label className="text-sm text-gray-600 w-48 flex-shrink-0">{s.label}</label>
                    {s.key.includes("enabled") ? (
                      <button
                        onClick={() => update(s.key, s.value === "true" ? "false" : "true")}
                        className={`relative w-10 h-6 rounded-full transition-colors ${s.value === "true" ? "bg-green-500" : "bg-gray-200"}`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.value === "true" ? "translate-x-4" : ""}`} />
                      </button>
                    ) : (
                      <input
                        value={s.value || ""}
                        onChange={e => update(s.key, e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                        placeholder={s.label}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {settings.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <Icon name="Settings" size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Настройки не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
