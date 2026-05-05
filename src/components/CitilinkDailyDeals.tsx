import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const deals = [
  {
    id: 1,
    name: "Ноутбук Lenovo IdeaPad 3 15ALC6",
    price: 49990,
    oldPrice: 62990,
    rating: 4.7,
    reviews: 234,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/94037c4d-73ce-4b5b-84df-b945f301fe10.jpg",
  },
  {
    id: 2,
    name: "Смартфон Samsung Galaxy A55 8/256GB",
    price: 34999,
    oldPrice: 42999,
    rating: 4.8,
    reviews: 512,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/fdd16d79-39dd-4bf1-9217-a99a6eb4949b.jpg",
  },
  {
    id: 3,
    name: "Телевизор LG 55NANO756QA 55\"",
    price: 52990,
    oldPrice: 67990,
    rating: 4.6,
    reviews: 89,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/1fed0e77-3402-4c81-a16b-2a8660c68428.jpg",
  },
  {
    id: 4,
    name: "Холодильник Haier A2F637CXMV",
    price: 68990,
    oldPrice: 79990,
    rating: 4.5,
    reviews: 156,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/1fed0e77-3402-4c81-a16b-2a8660c68428.jpg",
  },
  {
    id: 5,
    name: "Наушники Sony WH-1000XM5",
    price: 22990,
    oldPrice: 29990,
    rating: 4.9,
    reviews: 876,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/94037c4d-73ce-4b5b-84df-b945f301fe10.jpg",
  },
  {
    id: 6,
    name: "Планшет Apple iPad 10.9\" 64GB Wi-Fi",
    price: 44990,
    oldPrice: 49990,
    rating: 4.8,
    reviews: 341,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/fdd16d79-39dd-4bf1-9217-a99a6eb4949b.jpg",
  },
];

const VISIBLE = 4;

function getEndOfDay() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 0);
  return Math.floor((end.getTime() - now.getTime()) / 1000);
}

export default function CitilinkDailyDeals() {
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [seconds, setSeconds] = useState(getEndOfDay);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => (s <= 0 ? getEndOfDay() : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const fmt = (v: number) => String(v).padStart(2, "0");

  const maxOffset = deals.length - VISIBLE;

  const slide = (dir: "next" | "prev") => {
    if (animating) return;
    if (dir === "next" && offset >= maxOffset) return;
    if (dir === "prev" && offset <= 0) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setOffset((o) => (dir === "next" ? o + 1 : o - 1));
      setAnimating(false);
    }, 300);
  };

  const cardWidth = 100 / VISIBLE;
  const translateX = animating
    ? direction === "next"
      ? -(offset + 1) * cardWidth
      : -(offset - 1) * cardWidth
    : -offset * cardWidth;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-3">
      <div className="bg-white rounded-2xl px-5 py-4">

        {/* Header row */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-[#f47d20]">Товары дня</h2>
          {/* Timer inline */}
          <div className="flex items-center gap-1">
            <span className="bg-[#f47d20] text-white text-sm font-bold px-2 py-0.5 rounded-md tabular-nums">
              {fmt(hours)}
            </span>
            <span className="text-[#f47d20] font-bold">:</span>
            <span className="bg-[#f47d20] text-white text-sm font-bold px-2 py-0.5 rounded-md tabular-nums">
              {fmt(mins)}
            </span>
            <span className="text-[#f47d20] font-bold">:</span>
            <span className="bg-[#f47d20] text-white text-sm font-bold px-2 py-0.5 rounded-md tabular-nums">
              {fmt(secs)}
            </span>
          </div>
        </div>

        {/* Slider */}
        <div className="relative overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translateX(${translateX}%)`,
              transition: animating ? "transform 300ms cubic-bezier(0.25,0.46,0.45,0.94)" : "none",
            }}
          >
            {deals.map((p) => {
              const discount = p.oldPrice
                ? Math.round((1 - p.price / p.oldPrice) * 100)
                : 0;
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="flex-shrink-0 px-1.5"
                  style={{ width: `${cardWidth}%` }}
                >
                  <div className="border border-[#e8e8e8] rounded-2xl overflow-hidden hover:border-[#f47d20] hover:shadow-sm transition-all cursor-pointer group p-3 flex flex-col gap-2 h-full">

                    {/* Rating row */}
                    <div className="flex items-center gap-1.5">
                      <Icon name="Star" size={12} className="text-[#f47d20] fill-[#f47d20]" />
                      <span className="text-xs font-semibold text-gray-800">{p.rating}</span>
                      <Icon name="MessageCircle" size={11} className="text-gray-400 ml-0.5" />
                      <span className="text-xs text-gray-400">{p.reviews}</span>
                    </div>

                    {/* Image with discount badge */}
                    <div className="relative flex items-center justify-center bg-white rounded-xl overflow-hidden" style={{ height: 120 }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-[#f47d20] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    </div>

                    {/* Name */}
                    <p className="text-xs text-gray-800 leading-snug line-clamp-2 flex-1">
                      {p.name}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-auto">
                      <span className="text-lg font-bold text-gray-900">
                        {p.price.toLocaleString("ru")}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {p.oldPrice?.toLocaleString("ru")} ₽
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Right arrow — поверх последней карточки */}
          {offset < maxOffset && (
            <button
              onClick={() => slide("next")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-white border border-[#e8e8e8] rounded-l-xl shadow-md flex items-center justify-center text-gray-500 hover:text-[#f47d20] transition-colors"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          )}
          {offset > 0 && (
            <button
              onClick={() => slide("prev")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-white border border-[#e8e8e8] rounded-r-xl shadow-md flex items-center justify-center text-gray-500 hover:text-[#f47d20] transition-colors"
            >
              <Icon name="ChevronLeft" size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
