import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const CATALOG_API_URL = "https://functions.poehali.dev/15c8aecd-d37b-4aed-abce-dc0748135610";
const VISIBLE = 4;

interface NewProduct {
  id: number;
  name: string;
  price: number;
  old_price: number | null;
  image: string;
  in_stock: boolean;
}

function NewCard({ p, navigate, cardWidth }: { p: NewProduct; navigate: ReturnType<typeof useNavigate>; cardWidth: number }) {
  const [imgError, setImgError] = useState(false);
  const discount = p.old_price && p.old_price > p.price
    ? Math.round((1 - p.price / p.old_price) * 100)
    : 0;
  return (
    <div
      onClick={() => navigate(`/product/${p.id}`)}
      className="flex-shrink-0 px-1.5"
      style={{ width: `${cardWidth}%` }}
    >
      <div className="border border-[#e8e8e8] rounded-2xl overflow-hidden hover:border-[#e31e24] hover:shadow-sm transition-all cursor-pointer p-3 flex flex-col gap-2 h-full">
        <div className="relative flex items-center justify-center bg-white rounded-xl overflow-hidden" style={{ height: 120 }}>
          <img
            src={imgError || !p.image ? `https://picsum.photos/seed/${p.id}/300/300` : p.image}
            alt={p.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
          <span className="absolute top-2 left-2 bg-[#e31e24] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
          {discount > 0 && (
            <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {!p.in_stock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-lg border border-gray-200">Нет в наличии</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-800 leading-snug line-clamp-2 flex-1">{p.name}</p>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-gray-900">{p.price.toLocaleString("ru")}</span>
          {p.old_price && p.old_price > p.price && (
            <span className="text-xs text-gray-400 line-through">{p.old_price.toLocaleString("ru")} ₽</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServiceclickNewArrivals() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NewProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  useEffect(() => {
    fetch(`${CATALOG_API_URL}?action=featured&section=new`)
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const maxOffset = Math.max(0, items.length - VISIBLE);

  const slide = (dir: "next" | "prev") => {
    if (animating) return;
    if (dir === "next" && offset >= maxOffset) return;
    if (dir === "prev" && offset <= 0) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => { setOffset(o => dir === "next" ? o + 1 : o - 1); setAnimating(false); }, 300);
  };

  if (loading || items.length === 0) return null;

  const cardWidth = 100 / VISIBLE;
  const translateX = animating
    ? direction === "next" ? -(offset + 1) * cardWidth : -(offset - 1) * cardWidth
    : -offset * cardWidth;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-3">
      <div className="bg-white rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#e31e24] flex items-center gap-2">
            <Icon name="Sparkles" size={20} className="text-[#e31e24]" />
            Новинки
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex"
            style={{ transform: `translateX(${translateX}%)`, transition: animating ? "transform 300ms cubic-bezier(0.25,0.46,0.45,0.94)" : "none" }}
          >
            {items.map(p => <NewCard key={p.id} p={p} navigate={navigate} cardWidth={cardWidth} />)}
          </div>
        </div>

        {items.length > VISIBLE && (
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => slide("prev")} disabled={offset === 0} className="w-8 h-8 rounded-full border border-[#e8e8e8] flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] transition-colors disabled:opacity-30">
              <Icon name="ChevronLeft" size={16} />
            </button>
            <button onClick={() => slide("next")} disabled={offset >= maxOffset} className="w-8 h-8 rounded-full border border-[#e8e8e8] flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] transition-colors disabled:opacity-30">
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
