import { useState } from "react";
import Icon from "@/components/ui/icon";

const slides = [
  {
    id: 1,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/94037c4d-73ce-4b5b-84df-b945f301fe10.jpg",
    title: "Ноутбуки со скидкой",
    subtitle: "до 30% на топовые модели",
    cta: "Смотреть акцию",
    bg: "#1a1a2e",
  },
  {
    id: 2,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/fdd16d79-39dd-4bf1-9217-a99a6eb4949b.jpg",
    title: "Смартфоны — новинки сезона",
    subtitle: "Лучшие цены на флагманы",
    cta: "Перейти в раздел",
    bg: "#0f2027",
  },
  {
    id: 3,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/1fed0e77-3402-4c81-a16b-2a8660c68428.jpg",
    title: "Бытовая техника",
    subtitle: "Рассрочка 0% на 12 месяцев",
    cta: "Выбрать товар",
    bg: "#1a1a1a",
  },
];

const smallBanners = [
  { title: "Рассрочка 0%", sub: "на технику Apple", color: "#1d1d1f", text: "white" },
  { title: "Трейд-ин", sub: "Сдай старое — получи скидку", color: "#e31e24", text: "white" },
  { title: "Кэшбэк 5%", sub: "При оплате картой", color: "#f5f5f5", text: "#1a1a1a" },
];

export default function CitilinkHero() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-3 flex gap-3">
      {/* Main slider */}
      <div className="flex-1 relative rounded overflow-hidden h-[360px] min-w-0">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            style={{ background: slide.bg }}
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <p className="text-white/80 text-sm mb-1">{slide.subtitle}</p>
              <h2 className="text-white text-3xl font-bold mb-4">{slide.title}</h2>
              <button className="bg-[#e31e24] text-white text-sm font-semibold px-6 py-2.5 rounded w-fit hover:bg-[#c41920] transition-colors">
                {slide.cta}
              </button>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
        >
          <Icon name="ChevronRight" size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? "bg-white w-6 h-2" : "bg-white/50 w-2 h-2"}`}
            />
          ))}
        </div>
      </div>

      {/* Right banners */}
      <div className="flex flex-col gap-3 w-[260px] flex-shrink-0">
        {smallBanners.map((b, i) => (
          <div
            key={i}
            className="flex-1 rounded px-5 py-4 cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-center"
            style={{ background: b.color, color: b.text }}
          >
            <p className="font-bold text-lg leading-tight">{b.title}</p>
            <p className="text-sm opacity-80 mt-1">{b.sub}</p>
            <span className="text-xs mt-2 flex items-center gap-1 opacity-70">
              Подробнее <Icon name="ArrowRight" size={12} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
