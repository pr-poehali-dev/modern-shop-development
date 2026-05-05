import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const slides = [
  {
    id: 1,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/e34ef86e-f9b7-4dd5-97bb-4ee723062022.jpg",
    title: "Живите с комфортом!",
    subtitle: "Инновационные устройства\nУмного дома",
    cta: "Выбрать",
    bg: "linear-gradient(135deg, #c8d8f0 0%, #d8c8f0 50%, #e0d0f8 100%)",
  },
  {
    id: 2,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/89bc699e-1352-45e3-9972-d84681a044f4.jpg",
    title: "Техника для работы\nи учёбы",
    subtitle: "Ноутбуки, планшеты,\nаксессуары",
    cta: "Выбрать",
    bg: "linear-gradient(135deg, #cce4f0 0%, #d0eaff 50%, #e8f4ff 100%)",
  },
  {
    id: 3,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/fdd16d79-39dd-4bf1-9217-a99a6eb4949b.jpg",
    title: "Смартфоны — новинки\nсезона",
    subtitle: "Лучшие цены\nна флагманы",
    cta: "Выбрать",
    bg: "linear-gradient(135deg, #d0e8d8 0%, #c8e0f0 50%, #d8dff8 100%)",
  },
];

const TOTAL = slides.length;
const INTERVAL = 5000;

export default function CitilinkHero() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number, dir: "next" | "prev") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  };

  const prev = () => {
    const idx = (current - 1 + TOTAL) % TOTAL;
    goTo(idx, "prev");
  };

  const next = () => {
    const idx = (current + 1) % TOTAL;
    goTo(idx, "next");
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        setDirection("next");
        setAnimating(true);
        setTimeout(() => setAnimating(false), 400);
        return (c + 1) % TOTAL;
      });
    }, INTERVAL);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };
  const handleDot = (i: number) => { goTo(i, i > current ? "next" : "prev"); resetTimer(); };

  const slide = slides[current];

  const translateClass = animating
    ? direction === "next"
      ? "-translate-x-8 opacity-0"
      : "translate-x-8 opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-3 flex gap-3">
      {/* Main slider */}
      <div
        className="flex-1 relative rounded-lg overflow-hidden min-w-0"
        style={{ height: 280 }}
      >
        {/* Background */}
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{ background: slide.bg }}
        />

        {/* Content */}
        <div
          className={`absolute inset-0 flex items-center transition-all duration-400 ease-out ${translateClass}`}
        >
          {/* Text left */}
          <div className="flex flex-col justify-center pl-10 pr-4 z-10 flex-1">
            <h2 className="text-gray-900 text-2xl font-bold leading-tight mb-2 whitespace-pre-line">
              {slide.title}
            </h2>
            <p className="text-gray-600 text-sm mb-5 whitespace-pre-line leading-relaxed">
              {slide.subtitle}
            </p>
            <button className="flex items-center gap-0 w-fit overflow-hidden rounded group">
              <span className="bg-[#f47d20] text-white font-semibold text-sm px-5 py-2.5 group-hover:bg-[#e06a10] transition-colors">
                {slide.cta}
              </span>
              <span className="bg-[#d96a10] text-white px-3 py-2.5 flex items-center group-hover:bg-[#c05a08] transition-colors">
                <Icon name="ChevronRight" size={16} />
              </span>
            </button>
          </div>

          {/* Image right */}
          <div className="flex-1 h-full relative flex items-end justify-center">
            <img
              src={slide.image}
              alt={slide.title}
              className="h-[270px] w-auto object-contain object-bottom"
            />
          </div>
        </div>

        {/* Counter + arrows — bottom right */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-700 flex items-center justify-center shadow transition-colors"
          >
            <Icon name="ChevronLeft" size={16} />
          </button>

          <span className="text-sm text-gray-700 font-medium min-w-[44px] text-center">
            <span className="text-[#f47d20] font-bold">{current + 1}</span>
            <span className="text-gray-400"> / {TOTAL}</span>
          </span>

          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-700 flex items-center justify-center shadow transition-colors"
          >
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>

        {/* Disclaimer bottom left */}
        <p className="absolute bottom-2 left-4 z-20 text-[10px] text-gray-400">
          Реклама. Рекламодатель: ООО «Ситилинк»
        </p>
      </div>

      {/* Right banner */}
      <div
        className="w-[240px] flex-shrink-0 rounded-lg overflow-hidden relative cursor-pointer hover:opacity-95 transition-opacity"
        style={{
          background: "linear-gradient(160deg, #2c3e50 0%, #1a2535 100%)",
          height: 280,
        }}
      >
        <div className="p-5 z-10 relative">
          <h3 className="text-white font-bold text-xl leading-tight">
            Развивайте бизнес вместе с нами
          </h3>
        </div>
        <img
          src="https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/e2fd8f36-fe4b-4971-b5cc-0302c1199620.jpg"
          alt="Бизнес"
          className="absolute bottom-0 right-0 w-[180px] h-[180px] object-contain"
        />
      </div>
    </div>
  );
}
