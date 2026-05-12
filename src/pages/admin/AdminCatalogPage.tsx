import { useState, useEffect, useCallback, useRef } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const CATALOG_API_URL = "https://functions.poehali.dev/15c8aecd-d37b-4aed-abce-dc0748135610";

const TIME_OPTIONS = [
  "00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00",
  "08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00",
];

interface SyncStatus {
  times: string[];
  is_active: boolean;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_count: number | null;
  last_sync_error: string | null;
  product_count: number;
}

interface FeaturedProduct {
  id: number;
  section: string;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  sort_order: number;
}

interface SearchProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  sku: string;
}

interface SyncProgress {
  stage: "idle" | "categories" | "products" | "finish" | "done" | "error";
  page: number;
  totalPages: number;
  synced: number;
  elapsed: number;
  error?: string;
}

function SyncProgressBar({ progress }: { progress: SyncProgress }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (progress.stage === "idle" || progress.stage === "done" || progress.stage === "error") return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 500);
    return () => clearInterval(t);
  }, [progress.stage]);

  if (progress.stage === "idle") return null;

  const mins = Math.floor(progress.elapsed / 60);
  const secs = progress.elapsed % 60;
  const timeStr = mins > 0 ? `${mins}м ${secs}с` : `${secs}с`;

  const pct = progress.stage === "categories" ? 5
    : progress.stage === "products" && progress.totalPages > 0
      ? 5 + Math.round((progress.page / progress.totalPages) * 90)
    : progress.stage === "finish" ? 97
    : progress.stage === "done" ? 100
    : 5;

  const stageLabel =
    progress.stage === "categories" ? `Загрузка категорий${dots}` :
    progress.stage === "products" ? `Страница ${progress.page} из ${progress.totalPages || "?"}${dots}` :
    progress.stage === "finish" ? `Завершение${dots}` :
    progress.stage === "done" ? "Готово!" :
    progress.stage === "error" ? "Ошибка" : "";

  const isActive = progress.stage !== "done" && progress.stage !== "error";

  return (
    <div className={`rounded-2xl p-5 mb-4 border ${progress.stage === "error" ? "bg-red-50 border-red-200" : progress.stage === "done" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-100"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isActive && <div className="w-4 h-4 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin flex-shrink-0" />}
          {progress.stage === "done" && <Icon name="CheckCircle" size={16} className="text-green-500 flex-shrink-0" />}
          {progress.stage === "error" && <Icon name="AlertCircle" size={16} className="text-red-500 flex-shrink-0" />}
          <span className={`text-sm font-semibold ${progress.stage === "error" ? "text-red-700" : progress.stage === "done" ? "text-green-700" : "text-blue-800"}`}>
            {stageLabel}
          </span>
        </div>
        <span className={`text-xs tabular-nums ${progress.stage === "done" ? "text-green-500" : "text-blue-400"}`}>{timeStr}</span>
      </div>

      <div className={`h-2.5 rounded-full overflow-hidden mb-3 ${progress.stage === "error" ? "bg-red-100" : progress.stage === "done" ? "bg-green-100" : "bg-blue-100"}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${progress.stage === "error" ? "bg-red-400" : progress.stage === "done" ? "bg-green-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex gap-3">
          <span className={`flex items-center gap-1 ${progress.stage !== "categories" && progress.synced === 0 && progress.stage === "categories" ? "text-blue-600 font-medium" : "text-blue-400"}`}>
            <Icon name="Tag" size={11} /> Категории
          </span>
          <span className={`flex items-center gap-1 ${progress.stage === "products" ? "text-blue-700 font-semibold" : progress.stage === "finish" || progress.stage === "done" ? "text-blue-400" : "text-gray-300"}`}>
            <Icon name="Package" size={11} /> Товары
          </span>
          <span className={`flex items-center gap-1 ${progress.stage === "finish" || progress.stage === "done" ? "text-blue-400" : "text-gray-300"}`}>
            <Icon name="Database" size={11} /> Сохранение
          </span>
        </div>
        {progress.synced > 0 && (
          <span className="text-blue-600 font-medium">{progress.synced.toLocaleString("ru")} товаров</span>
        )}
      </div>

      {progress.stage === "error" && progress.error && (
        <p className="text-xs text-red-600 mt-2 bg-red-100 rounded-lg px-3 py-2">{progress.error}</p>
      )}
    </div>
  );
}

const IDLE_PROGRESS: SyncProgress = { stage: "idle", page: 0, totalPages: 0, synced: 0, elapsed: 0 };

function SyncTab({ token }: { token: string }) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<SyncProgress>(IDLE_PROGRESS);
  const [times, setTimes] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CATALOG_API_URL}?action=sync_status`, {
        headers: { "X-Admin-Token": token },
      });
      const data = await res.json();
      setStatus(data);
      setTimes(data.times || ["08:00", "14:00", "20:00"]);
      setIsActive(data.is_active ?? true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const post = async (action: string, body: object) => {
    const res = await fetch(`${CATALOG_API_URL}?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const handleSync = async () => {
    // Запускаем таймер
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setProgress(p => ({ ...p, elapsed }));
    }, 1000);

    setProgress({ stage: "categories", page: 0, totalPages: 0, synced: 0, elapsed: 0 });

    try {
      // 1. Категории
      await post("sync_categories", {});

      // 2. Страницы товаров
      let page = 1;
      let totalPages = 1;
      let totalSynced = 0;

      while (page <= totalPages) {
        setProgress(p => ({ ...p, stage: "products", page, totalPages }));
        const data = await post("sync_page", { page });
        if (!data.ok) throw new Error(data.error || `Ошибка страницы ${page}`);
        totalSynced += data.synced;
        totalPages = data.total_pages;
        setProgress(p => ({ ...p, page, totalPages, synced: totalSynced }));
        page += 1;
      }

      // 3. Финализация
      setProgress(p => ({ ...p, stage: "finish" }));
      await post("sync_finish", { total_synced: totalSynced });

      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(p => ({ ...p, stage: "done", synced: totalSynced }));
      toast.success(`Готово! Синхронизировано ${totalSynced} товаров`);
      load();
    } catch (e: unknown) {
      if (timerRef.current) clearInterval(timerRef.current);
      const msg = e instanceof Error ? e.message : "Ошибка соединения";
      setProgress(p => ({ ...p, stage: "error", error: msg }));
      toast.error(msg);
    }
  };

  const addTime = () => {
    const available = TIME_OPTIONS.filter(t => !times.includes(t));
    if (available.length === 0) return;
    setTimes(prev => [...prev, available[0]].sort());
  };

  const removeTime = (t: string) => {
    if (times.length <= 1) { toast.error("Должно быть хотя бы одно время"); return; }
    setTimes(prev => prev.filter(x => x !== t));
  };

  const changeTime = (idx: number, val: string) => {
    if (times.includes(val) && times[idx] !== val) { toast.error("Это время уже добавлено"); return; }
    const updated = [...times];
    updated[idx] = val;
    setTimes(updated.sort());
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${CATALOG_API_URL}?action=update_schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ action: "update_schedule", times, is_active: isActive }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Расписание сохранено");
        load();
      } else {
        toast.error(data.error || "Ошибка");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" /></div>;

  return (
    <div className="space-y-5">
      {/* Статус */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="Database" size={18} className="text-[#e31e24]" /> Состояние каталога
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Товаров в базе</p>
            <p className="text-2xl font-bold text-gray-900">{status?.product_count ?? 0}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Последняя синхронизация</p>
            <p className="text-sm font-medium text-gray-900">
              {status?.last_sync_at
                ? new Date(status.last_sync_at).toLocaleString("ru", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                : "Не выполнялась"}
            </p>
            {status?.last_sync_status === "ok" && (
              <p className="text-xs text-green-600 mt-0.5">✓ Успешно, {status.last_sync_count} товаров</p>
            )}
            {status?.last_sync_status === "error" && (
              <p className="text-xs text-red-500 mt-0.5">✗ Ошибка</p>
            )}
          </div>
        </div>
        {status?.last_sync_error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
            <b>Ошибка:</b> {status.last_sync_error}
          </div>
        )}
        <SyncProgressBar progress={progress} />
        <button
          onClick={progress.stage === "idle" || progress.stage === "done" || progress.stage === "error" ? handleSync : undefined}
          disabled={progress.stage !== "idle" && progress.stage !== "done" && progress.stage !== "error"}
          className="w-full py-2.5 bg-[#e31e24] hover:bg-[#c41920] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {progress.stage !== "idle" && progress.stage !== "done" && progress.stage !== "error"
            ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Синхронизируем...</>
            : <><Icon name="RefreshCw" size={15} /> {progress.stage === "done" ? "Синхронизировать снова" : "Синхронизировать сейчас"}</>
          }
        </button>
      </div>

      {/* Расписание */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="Clock" size={18} className="text-[#e31e24]" /> Расписание автозагрузки
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-500">Активно</span>
            <div
              onClick={() => setIsActive(v => !v)}
              className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${isActive ? "bg-green-500" : "bg-gray-200"}`}
              style={{ width: 40, height: 22 }}
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all ${isActive ? "left-[18px]" : "left-0.5"}`} style={{ width: 18, height: 18, top: 2, left: isActive ? 20 : 2 }} />
            </div>
          </label>
        </div>

        <p className="text-sm text-gray-500 mb-3">Укажите время (до 8 раз в сутки), когда каталог будет автоматически обновляться из CRM:</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {times.map((t, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-xl px-2 py-1">
              <select
                value={t}
                onChange={e => changeTime(idx, e.target.value)}
                className="bg-transparent text-sm font-medium text-blue-700 focus:outline-none"
              >
                {TIME_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button onClick={() => removeTime(t)} className="text-blue-400 hover:text-red-500 ml-1">
                <Icon name="X" size={13} />
              </button>
            </div>
          ))}
          {times.length < 8 && (
            <button onClick={addTime} className="flex items-center gap-1 px-3 py-1 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] transition-colors">
              <Icon name="Plus" size={13} /> Добавить время
            </button>
          )}
        </div>

        <button
          onClick={saveSchedule}
          disabled={saving}
          className="px-5 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          {saving ? "Сохраняем..." : "Сохранить расписание"}
        </button>
      </div>
    </div>
  );
}

function FeaturedTab({ token, section }: { token: string; section: "daily" | "new" }) {
  const [items, setItems] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API_URL}?action=catalog_featured&section=${section}`, {
        headers: { "X-Admin-Token": token },
      });
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, [token, section]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim() || search.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${ADMIN_API_URL}?action=catalog_search&q=${encodeURIComponent(search)}`, {
          headers: { "X-Admin-Token": token },
        });
        const data = await res.json();
        setSearchResults(data.items || []);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search, token]);

  const addProduct = async (p: SearchProduct) => {
    if (items.some(i => i.product_id === p.id)) { toast.error("Товар уже добавлен"); return; }
    setAddingId(p.id);
    try {
      const res = await fetch(`${ADMIN_API_URL}?action=catalog_featured&section=${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ product_id: p.id, section }),
      });
      const data = await res.json();
      if (data.id) {
        toast.success("Товар добавлен");
        setSearch("");
        setSearchResults([]);
        load();
      } else {
        toast.error(data.error || "Ошибка");
      }
    } finally {
      setAddingId(null);
    }
  };

  const removeProduct = async (fid: number) => {
    setRemovingId(fid);
    try {
      const res = await fetch(`${ADMIN_API_URL}?action=catalog_featured&section=${section}&id=${fid}`, {
        method: "DELETE",
        headers: { "X-Admin-Token": token },
        body: JSON.stringify({ id: fid, section }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Удалено");
        load();
      }
    } finally {
      setRemovingId(null);
    }
  };

  const sectionLabel = section === "daily" ? "Товары дня" : "Новинки";

  return (
    <div className="space-y-4">
      {/* Поиск и добавление */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="Search" size={16} className="text-[#e31e24]" /> Добавить товар в «{sectionLabel}»
        </h3>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию или артикулу..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:border-[#e31e24]"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#e31e24] animate-spin" />
            </div>
          )}
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden">
            {searchResults.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                {p.image && <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sku && `Арт. ${p.sku} · `}{p.price.toLocaleString("ru")} ₽</p>
                </div>
                <button
                  onClick={() => addProduct(p)}
                  disabled={addingId === p.id || items.some(i => i.product_id === p.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${items.some(i => i.product_id === p.id) ? "bg-gray-100 text-gray-400" : "bg-[#e31e24] text-white hover:bg-[#c41920]"}`}
                >
                  {items.some(i => i.product_id === p.id) ? "Уже есть" : addingId === p.id ? "..." : "+ Добавить"}
                </button>
              </div>
            ))}
          </div>
        )}
        {search.length >= 2 && !searching && searchResults.length === 0 && (
          <p className="text-sm text-gray-400 mt-2 text-center">Товары не найдены. Сначала выполните синхронизацию каталога.</p>
        )}
      </div>

      {/* Список */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Текущий состав «{sectionLabel}» ({items.length} шт.)</h3>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Icon name={section === "daily" ? "Star" : "Sparkles"} size={36} className="mx-auto mb-2 text-gray-200" />
            <p>Список пуст. Добавьте товары через поиск выше.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                {item.product_image && (
                  <img src={item.product_image} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product_name}</p>
                  <p className="text-xs text-gray-500">{item.product_price.toLocaleString("ru")} ₽</p>
                </div>
                <button
                  onClick={() => removeProduct(item.id)}
                  disabled={removingId === item.id}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCatalogPage() {
  const { token } = useAdminAuth();
  const [tab, setTab] = useState<"sync" | "daily" | "new">("sync");

  const tabs = [
    { id: "sync" as const, label: "Синхронизация", icon: "RefreshCw" },
    { id: "daily" as const, label: "Товары дня", icon: "Star" },
    { id: "new" as const, label: "Новинки", icon: "Sparkles" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Каталог товаров</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Icon name={t.icon as "Star"} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sync" && <SyncTab token={token!} />}
      {tab === "daily" && <FeaturedTab token={token!} section="daily" />}
      {tab === "new" && <FeaturedTab token={token!} section="new" />}
    </div>
  );
}