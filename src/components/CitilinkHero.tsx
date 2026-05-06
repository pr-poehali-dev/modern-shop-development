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

export default function ServiceclickHero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = () => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    const step = 100 / (INTERVAL / 50);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(progressRef.current!); return 100; }
        return p + step;
      });
    }, 50);
  };

  const goTo = (idx: number, dir: "next" | "prev") => {
    if (animating) return;
    setDirection(dir);
    setPrev(current);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setPrev(null);
      setAnimating(false);
    }, 420);
    startProgress();
  };

  const handlePrev = () => {
    const idx = (current - 1 + TOTAL) % TOTAL;
    goTo(idx, "prev");
    resetTimer();
  };

  const handleNext = () => {
    const idx = (current + 1) % TOTAL;
    goTo(idx, "next");
    resetTimer();
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % TOTAL;
        setDirection("next");
        setPrev(c);
        setAnimating(true);
        setTimeout(() => { setPrev(null); setAnimating(false); }, 420);
        startProgress();
        return next;
      });
    }, INTERVAL);
  };

  useEffect(() => {
    startProgress();
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const getSlideStyle = (i: number): React.CSSProperties => {
    if (i === current) {
      return animating
        ? { transform: direction === "next" ? "translateX(100%)" : "translateX(-100%)", opacity: 0, transition: "none" }
        : { transform: "translateX(0)", opacity: 1, transition: "transform 420ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 420ms" };
    }
    if (i === prev) {
      return animating
        ? { transform: direction === "next" ? "translateX(-30%)" : "translateX(30%)", opacity: 0, transition: "transform 420ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 420ms" }
        : { transform: "translateX(0)", opacity: 1, transition: "none" };
    }
    return { transform: "translateX(100%)", opacity: 0, transition: "none" };
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-3 flex gap-3">
      {/* Main slider */}
      <div className="flex-1 relative rounded-3xl overflow-hidden min-w-0" style={{ height: 280 }}>

        {/* Slides */}
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 flex items-center"
            style={{ background: slide.bg, ...getSlideStyle(i) }}
          >
            {/* Text */}
            <div className="flex flex-col justify-center pl-10 pr-4 z-10 flex-1">
              <h2 className="text-gray-900 text-2xl font-bold leading-tight mb-2 whitespace-pre-line">
                {slide.title}
              </h2>
              <p className="text-gray-600 text-sm mb-5 whitespace-pre-line leading-relaxed">
                {slide.subtitle}
              </p>
              <button className="flex items-center gap-0 w-fit overflow-hidden rounded-lg group">
                <span className="bg-[#f47d20] text-white font-semibold text-sm px-5 py-2.5 group-hover:bg-[#e06a10] transition-colors">
                  {slide.cta}
                </span>
                <span className="bg-[#d96a10] text-white px-3 py-2.5 flex items-center group-hover:bg-[#c05a08] transition-colors">
                  <Icon name="ChevronRight" size={16} />
                </span>
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 h-full flex items-end justify-center">
              <img
                src={slide.image}
                alt={slide.title}
                className="h-[270px] w-auto object-contain object-bottom"
              />
            </div>
          </div>
        ))}

        {/* Counter + arrows */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-700 flex items-center justify-center shadow transition-colors"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>

            <span className="text-sm font-medium min-w-[44px] text-center">
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

          {/* Progress bar */}
          <div className="w-[88px] h-[3px] bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f47d20] rounded-full"
              style={{ width: `${progress}%`, transition: progress === 0 ? "none" : "width 50ms linear" }}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <p className="absolute bottom-2 left-4 z-20 text-[10px] text-gray-400">
          Реклама. Рекламодатель: ООО «Serviceclick»
        </p>
      </div>

      {/* Right banner */}
      <div
        className="w-[240px] flex-shrink-0 rounded-3xl overflow-hidden relative cursor-pointer hover:opacity-95 transition-opacity"
        style={{ background: "linear-gradient(160deg, #2c3e50 0%, #1a2535 100%)", height: 280 }}
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