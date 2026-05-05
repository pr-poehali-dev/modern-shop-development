import { useState, useEffect, useRef } from "react";
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name="Star"
          size={11}
          className={s <= Math.round(rating) ? "text-[#ffc107] fill-[#ffc107]" : "text-gray-300 fill-gray-300"}
        />
      ))}
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#1a1a1a] text-white font-bold text-xl w-12 h-12 rounded-xl flex items-center justify-center tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] text-gray-500 mt-1">{label}</span>
    </div>
  );
}

export default function CitilinkDailyDeals() {
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [seconds, setSeconds] = useState(getEndOfDay);
  const trackRef = useRef<HTMLDivElement>(null);

  // Countdown
  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => (s <= 0 ? getEndOfDay() : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const maxOffset = deals.length - VISIBLE;

  const slide = (dir: "next" | "prev") => {
    if (animating) return;
    if (dir === "next" && offset >= maxOffset) return;
    if (dir === "prev" && offset <= 0) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setOffset((o) => dir === "next" ? o + 1 : o - 1);
      setAnimating(false);
    }, 320);
  };

  const cardWidth = 100 / VISIBLE;
  const translateX = animating
    ? direction === "next"
      ? -(offset + 1) * cardWidth
      : -(offset - 1) * cardWidth
    : -offset * cardWidth;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-2">
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Icon name="Flame" size={22} className="text-[#e31e24]" />
            <h2 className="text-xl font-bold text-gray-900">Товары дня</h2>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 ml-1">
            <span className="text-sm text-gray-500">Успейте купить:</span>
            <div className="flex items-center gap-1.5">
              <TimeBlock value={hours} label="часов" />
              <span className="text-gray-400 font-bold text-xl mb-4">:</span>
              <TimeBlock value={mins} label="минут" />
              <span className="text-gray-400 font-bold text-xl mb-4">:</span>
              <TimeBlock value={secs} label="секунд" />
            </div>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => slide("prev")}
              disabled={offset === 0}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="ChevronLeft" size={18} />
            </button>
            <button
              onClick={() => slide("next")}
              disabled={offset >= maxOffset}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="overflow-hidden px-4 py-4">
          <div
            ref={trackRef}
            className="flex"
            style={{
              transform: `translateX(${translateX}%)`,
              transition: animating ? "transform 320ms cubic-bezier(0.25,0.46,0.45,0.94)" : "none",
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
                  className="flex-shrink-0 cursor-pointer group px-2"
                  style={{ width: `${cardWidth}%` }}
                >
                  <div className="border border-[#e0e0e0] rounded-2xl overflow-hidden hover:border-[#e31e24] hover:shadow-md transition-all flex flex-col h-full">
                    {/* Image */}
                    <div className="relative bg-[#f8f8f8]">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-40 object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#e31e24] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">
                        −{discount}%
                      </span>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:text-[#e31e24] transition-all"
                      >
                        <Icon name="Heart" size={13} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs text-gray-800 leading-tight line-clamp-2 mb-2 flex-1">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1 mb-2">
                        <StarRating rating={p.rating} />
                        <span className="text-[10px] text-gray-400">({p.reviews})</span>
                      </div>
                      <div className="mb-3">
                        <p className="text-base font-bold text-gray-900">
                          {p.price.toLocaleString("ru")} ₽
                        </p>
                        <p className="text-xs text-gray-400 line-through">
                          {p.oldPrice?.toLocaleString("ru")} ₽
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="w-full bg-[#e31e24] hover:bg-[#c41920] text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        <Icon name="ShoppingCart" size={13} />
                        В корзину
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
