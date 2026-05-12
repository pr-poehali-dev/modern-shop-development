import { useEffect, useState, useCallback, useRef } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

// Мини-превью эффекта перехода
function EffectPreview({ effect, image }: { effect: string; image?: string }) {
  const [step, setStep] = useState<"a" | "b">("a");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setStep(s => s === "a" ? "b" : "a");
        setAnimating(false);
      }, 450);
    }, 1800);
    return () => clearInterval(t);
  }, [effect]);

  const colors = ["linear-gradient(135deg,#c8d8f0,#e0d0f8)", "linear-gradient(135deg,#cce4f0,#e8f4ff)"];
  const labels = ["Слайд 1", "Слайд 2"];
  const activeIdx = step === "a" ? 0 : 1;
  const prevIdx = step === "a" ? 1 : 0;

  const getStyle = (i: number): React.CSSProperties => {
    const isActive = i === activeIdx;
    const isPrev = i === prevIdx;
    if (effect === "fade") {
      if (isActive) return { opacity: animating ? 0 : 1, transform: "none", transition: animating ? "none" : "opacity 450ms ease", zIndex: 2 };
      if (isPrev) return { opacity: animating ? 1 : 0, transform: "none", transition: "opacity 450ms ease", zIndex: 1 };
      return { opacity: 0, zIndex: 0, transition: "none" };
    }
    if (effect === "zoom") {
      if (isActive) return animating
        ? { opacity: 0, transform: "scale(1.1)", transition: "none", zIndex: 2 }
        : { opacity: 1, transform: "scale(1)", transition: "opacity 450ms, transform 450ms", zIndex: 2 };
      if (isPrev) return animating
        ? { opacity: 1, transform: "scale(1)", transition: "opacity 450ms, transform 450ms", zIndex: 1 }
        : { opacity: 0, transform: "scale(0.92)", zIndex: 1, transition: "none" };
      return { opacity: 0, zIndex: 0, transition: "none" };
    }
    if (effect === "flip") {
      if (isActive) return animating
        ? { opacity: 0, transform: "rotateY(90deg)", transition: "none", zIndex: 2 }
        : { opacity: 1, transform: "rotateY(0deg)", transition: "opacity 400ms, transform 400ms", zIndex: 2 };
      if (isPrev) return animating
        ? { opacity: 1, transform: "rotateY(0deg)", transition: "opacity 400ms, transform 400ms", zIndex: 1 }
        : { opacity: 0, transform: "rotateY(-90deg)", zIndex: 1, transition: "none" };
      return { opacity: 0, zIndex: 0, transition: "none" };
    }
    if (effect === "slide-up") {
      if (isActive) return animating
        ? { transform: "translateY(40px)", opacity: 0, transition: "none", zIndex: 2 }
        : { transform: "translateY(0)", opacity: 1, transition: "transform 450ms, opacity 450ms", zIndex: 2 };
      if (isPrev) return animating
        ? { transform: "translateY(-20px)", opacity: 0, transition: "transform 450ms, opacity 450ms", zIndex: 1 }
        : { transform: "translateY(0)", opacity: 1, zIndex: 1, transition: "none" };
      return { opacity: 0, zIndex: 0, transition: "none" };
    }
    // slide
    if (isActive) return animating
      ? { transform: "translateX(100%)", opacity: 0, transition: "none", zIndex: 2 }
      : { transform: "translateX(0)", opacity: 1, transition: "transform 420ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 420ms", zIndex: 2 };
    if (isPrev) return animating
      ? { transform: "translateX(-30%)", opacity: 0, transition: "transform 420ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 420ms", zIndex: 1 }
      : { transform: "translateX(0)", opacity: 1, zIndex: 1, transition: "none" };
    return { transform: "translateX(100%)", opacity: 0, zIndex: 0, transition: "none" };
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0" style={{ width: 160, height: 80, perspective: "800px" }}>
      {[0, 1].map(i => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-600"
          style={{ background: colors[i], ...getStyle(i) }}
        >
          {image && i === activeIdx ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{labels[i]}</span>
          )}
        </div>
      ))}
      <div className="absolute bottom-1.5 right-2 z-10 flex gap-1">
        {[0, 1].map(i => (
          <div key={i} className={`rounded-full transition-all ${i === activeIdx ? "w-3 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  button_text: string;
  is_active: boolean;
  sort_order: number;
  timer: number;
  effect: string;
  bg_color: string;
}

const EFFECTS = [
  { value: "slide", label: "Слайд (горизонтально)" },
  { value: "fade", label: "Плавное появление" },
  { value: "zoom", label: "Приближение" },
  { value: "flip", label: "Переворот" },
  { value: "slide-up", label: "Слайд снизу" },
];

const TIMERS = [
  { value: 3000, label: "3 сек" },
  { value: 5000, label: "5 сек" },
  { value: 7000, label: "7 сек" },
  { value: 10000, label: "10 сек" },
  { value: 15000, label: "15 сек" },
];

const empty: Omit<Banner, "id"> = {
  title: "", subtitle: "", image_url: "", link: "", button_text: "",
  is_active: true, sort_order: 0, timer: 5000, effect: "slide", bg_color: "",
};

export default function AdminBannersPage() {
  const { token } = useAdminAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Banner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageFilename, setImageFilename] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${ADMIN_API_URL}?action=banners`, { headers: { "X-Admin-Token": token! } });
    const data = await res.json();
    setBanners(data.items || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openModal = (b?: Banner) => {
    setModal(b ? { ...b } : { ...empty });
    setImagePreview(b?.image_url || "");
    setImageBase64("");
    setImageFilename("");
  };

  const handleFileChange = (file: File) => {
    if (!file) return;
    setImageFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileChange(file);
  };

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    setUploading(!!imageBase64);
    const method = modal.id ? "PUT" : "POST";
    const payload: Record<string, unknown> = { ...modal };
    if (imageBase64) {
      payload.image_base64 = imageBase64;
      payload.image_filename = imageFilename;
    } else {
      payload.image_url = imagePreview || "";
    }
    console.log("[save] method=", method, "token=", token, "payload=", JSON.stringify(payload).slice(0, 200));
    const res = await fetch(`${ADMIN_API_URL}?action=banners`, {
      method,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("[save] response status=", res.status, "data=", data);
    if (data.image_url) setImagePreview(data.image_url);
    setSaving(false);
    setUploading(false);
    setModal(null);
    load();
    toast.success(modal.id ? "Баннер обновлён" : "Баннер добавлен");
  };

  const toggleActive = async (b: Banner) => {
    await fetch(`${ADMIN_API_URL}?action=banners`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ ...b, is_active: !b.is_active }),
    });
    load();
    toast.success(b.is_active ? "Баннер скрыт" : "Баннер включён");
  };

  const deleteBanner = (b: Banner) => {
    toast("Удалить баннер?", {
      description: `«${b.title || "Без заголовка"}» будет скрыт с сайта`,
      action: {
        label: "Удалить",
        onClick: async () => {
          await fetch(`${ADMIN_API_URL}?action=banners`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
            body: JSON.stringify({ id: b.id }),
          });
          load();
          toast.error("Баннер удалён");
        },
      },
      cancel: { label: "Отмена", onClick: () => {} },
    });
  };

  // Drag-and-drop для сортировки
  const handleDragStart = (id: number) => setDragItem(id);
  const handleDragEnd = () => { setDragItem(null); setDragOver(null); };

  const handleDropOrder = async (targetId: number) => {
    if (dragItem === null || dragItem === targetId) return;
    const from = banners.findIndex(b => b.id === dragItem);
    const to = banners.findIndex(b => b.id === targetId);
    const reordered = [...banners];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const updated = reordered.map((b, i) => ({ ...b, sort_order: i }));
    setBanners(updated);
    setDragOver(null);
    setDragItem(null);
    await Promise.all(updated.map(b =>
      fetch(`${ADMIN_API_URL}?action=banners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
        body: JSON.stringify(b),
      })
    ));
    toast.success("Порядок сохранён");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Баннеры главной страницы</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors">
          <Icon name="Plus" size={16} /> Добавить баннер
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-sm text-blue-700 flex items-center gap-2">
        <Icon name="GripVertical" size={16} />
        Перетаскивайте карточки чтобы изменить порядок отображения
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
          {banners.map((b, idx) => (
            <div
              key={b.id}
              draggable
              onDragStart={() => handleDragStart(b.id)}
              onDragEnd={handleDragEnd}
              onDragOver={e => { e.preventDefault(); setDragOver(b.id); }}
              onDrop={() => handleDropOrder(b.id)}
              className={`bg-white rounded-2xl border transition-all ${dragOver === b.id ? "border-[#e31e24] scale-[1.01]" : "border-gray-100"} ${dragItem === b.id ? "opacity-40" : ""} ${!b.is_active ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Drag handle + order */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-grab active:cursor-grabbing">
                  <Icon name="GripVertical" size={18} className="text-gray-300" />
                  <span className="text-[10px] text-gray-400">#{idx + 1}</span>
                </div>

                {/* Preview */}
                {b.image_url ? (
                  <img src={b.image_url} alt="" className="w-28 h-16 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-28 h-16 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: b.bg_color || "#f3f4f6" }}>
                    <Icon name="Image" size={22} className="text-gray-400" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{b.title || "Без заголовка"}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{b.subtitle}</p>
                  <div className="flex gap-3 mt-1.5 flex-wrap">
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Icon name="Clock" size={10} /> {(b.timer / 1000).toFixed(0)} сек
                    </span>
                    <span className="text-[11px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Icon name="Sparkles" size={10} /> {EFFECTS.find(e => e.value === b.effect)?.label || b.effect}
                    </span>
                    {b.link && <span className="text-[11px] text-blue-500 truncate max-w-[120px]">{b.link}</span>}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(b)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${b.is_active ? "bg-green-500" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${b.is_active ? "translate-x-4" : ""}`} />
                  </button>
                  <button onClick={() => openModal(b)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <Icon name="Pencil" size={15} className="text-gray-500" />
                  </button>
                  <button onClick={() => deleteBanner(b)} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                    <Icon name="Trash2" size={15} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">{modal.id ? "Редактировать баннер" : "Новый баннер"}</h2>
              <button onClick={() => setModal(null)}><Icon name="X" size={18} className="text-gray-400" /></button>
            </div>

            {/* Image upload */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs text-gray-500">Изображение баннера</label>
                <span className="text-[11px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Icon name="Ruler" size={10} /> Рекомендуется 900 × 280 px
                </span>
              </div>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#e31e24] transition-colors relative"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="" className="w-full h-36 object-cover rounded-lg" />
                    <button
                      onClick={e => { e.stopPropagation(); setImagePreview(""); setImageBase64(""); setModal(m => m ? { ...m, image_url: "" } : m); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white"
                    >
                      <Icon name="X" size={13} className="text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Icon name="Upload" size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">Перетащите файл или нажмите для выбора</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP до 10MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
              </div>
              {!imagePreview && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Или вставьте URL изображения..."
                    value={modal.image_url || ""}
                    onChange={e => { setModal({ ...modal, image_url: e.target.value }); setImagePreview(e.target.value); }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              {[
                { key: "title", label: "Заголовок" },
                { key: "subtitle", label: "Подзаголовок" },
                { key: "link", label: "Ссылка (URL)" },
                { key: "button_text", label: "Текст кнопки" },
                { key: "bg_color", label: "Цвет фона (если нет картинки)", placeholder: "#f3f4f6 или linear-gradient(...)" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    value={String(modal[f.key as keyof typeof modal] ?? "")}
                    onChange={e => setModal({ ...modal, [f.key]: e.target.value })}
                    placeholder={"placeholder" in f ? f.placeholder : ""}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                {/* Timer */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Таймер показа</label>
                  <select
                    value={modal.timer ?? 5000}
                    onChange={e => setModal({ ...modal, timer: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                  >
                    {TIMERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {/* Effect */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Эффект перехода</label>
                  <select
                    value={modal.effect ?? "slide"}
                    onChange={e => setModal({ ...modal, effect: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e31e24]"
                  >
                    {EFFECTS.map(ef => <option key={ef.value} value={ef.value}>{ef.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Effect preview */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <EffectPreview key={modal.effect} effect={modal.effect ?? "slide"} image={imagePreview || undefined} />
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-0.5">Предпросмотр эффекта</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {EFFECTS.find(e => e.value === modal.effect)?.label ?? "Слайд"}<br/>
                    Анимация воспроизводится автоматически
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!modal.is_active} onChange={e => setModal({ ...modal, is_active: e.target.checked })} className="w-4 h-4 accent-[#e31e24]" />
                <span className="text-sm text-gray-700">Активен (показывать на сайте)</span>
              </label>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Отмена</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-[#e31e24] text-white rounded-xl text-sm hover:bg-[#c41920] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {uploading && <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                {saving ? (uploading ? "Загружаем фото..." : "Сохраняем...") : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}