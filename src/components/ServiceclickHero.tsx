import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const ADMIN_API = "https://functions.poehali.dev/58efb070-a53e-4380-88c5-6f0f16480430";

const FALLBACK_SLIDES = [
  {
    id: 1,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/e34ef86e-f9b7-4dd5-97bb-4ee723062022.jpg",
    title: "Живите с комфортом!",
    subtitle: "Инновационные устройства\nУмного дома",
    button_text: "Выбрать",
    bg_color: "linear-gradient(135deg, #c8d8f0 0%, #d8c8f0 50%, #e0d0f8 100%)",
    link: "",
    timer: 5000,
    effect: "slide",
  },
  {
    id: 2,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/89bc699e-1352-45e3-9972-d84681a044f4.jpg",
    title: "Техника для работы\nи учёбы",
    subtitle: "Ноутбуки, планшеты,\nаксессуары",
    button_text: "Выбрать",
    bg_color: "linear-gradient(135deg, #cce4f0 0%, #d0eaff 50%, #e8f4ff 100%)",
    link: "",
    timer: 5000,
    effect: "slide",
  },
  {
    id: 3,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/fdd16d79-39dd-4bf1-9217-a99a6eb4949b.jpg",
    title: "Смартфоны — новинки\nсезона",
    subtitle: "Лучшие цены\nна флагманы",
    button_text: "Выбрать",
    bg_color: "linear-gradient(135deg, #d0e8d8 0%, #c8e0f0 50%, #d8dff8 100%)",
    link: "",
    timer: 5000,
    effect: "slide",
  },
];

interface SlideData {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  button_text: string;
  bg_color: string;
  link: string;
  timer: number;
  effect: string;
}

// Стили переходов для каждого эффекта
function getSlideStyle(
  i: number,
  current: number,
  prev: number | null,
  animating: boolean,
  direction: "next" | "prev",
  effect: string
): React.CSSProperties {
  const isActive = i === current;
  const isPrev = i === prev;

  if (effect === "fade") {
    if (isActive) return { opacity: animating ? 0 : 1, transform: "translateX(0)", transition: animating ? "none" : "opacity 500ms ease", zIndex: 2 };
    if (isPrev) return { opacity: animating ? 1 : 0, transform: "translateX(0)", transition: "opacity 500ms ease", zIndex: 1 };
    return { opacity: 0, transform: "translateX(0)", zIndex: 0, transition: "none" };
  }

  if (effect === "zoom") {
    if (isActive) return animating
      ? { opacity: 0, transform: "scale(1.08)", transition: "none", zIndex: 2 }
      : { opacity: 1, transform: "scale(1)", transition: "opacity 500ms ease, transform 500ms ease", zIndex: 2 };
    if (isPrev) return animating
      ? { opacity: 1, transform: "scale(1)", transition: "opacity 500ms ease, transform 500ms ease", zIndex: 1 }
      : { opacity: 0, transform: "scale(0.95)", transition: "none", zIndex: 1 };
    return { opacity: 0, transform: "scale(1)", zIndex: 0, transition: "none" };
  }

  if (effect === "flip") {
    if (isActive) return animating
      ? { opacity: 0, transform: "rotateY(90deg)", transition: "none", zIndex: 2 }
      : { opacity: 1, transform: "rotateY(0deg)", transition: "opacity 400ms ease, transform 400ms ease", zIndex: 2 };
    if (isPrev) return animating
      ? { opacity: 1, transform: "rotateY(0deg)", transition: "opacity 400ms ease, transform 400ms ease", zIndex: 1 }
      : { opacity: 0, transform: "rotateY(-90deg)", transition: "none", zIndex: 1 };
    return { opacity: 0, transform: "rotateY(90deg)", zIndex: 0, transition: "none" };
  }

  if (effect === "slide-up") {
    if (isActive) return animating
      ? { transform: "translateY(60px)", opacity: 0, transition: "none", zIndex: 2 }
      : { transform: "translateY(0)", opacity: 1, transition: "transform 450ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 450ms", zIndex: 2 };
    if (isPrev) return animating
      ? { transform: "translateY(-30px)", opacity: 0, transition: "transform 450ms ease, opacity 450ms", zIndex: 1 }
      : { transform: "translateY(0)", opacity: 1, transition: "none", zIndex: 1 };
    return { transform: "translateY(60px)", opacity: 0, zIndex: 0, transition: "none" };
  }

  // default: slide
  if (isActive) return animating
    ? { transform: direction === "next" ? "translateX(100%)" : "translateX(-100%)", opacity: 0, transition: "none", zIndex: 2 }
    : { transform: "translateX(0)", opacity: 1, transition: "transform 420ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 420ms", zIndex: 2 };
  if (isPrev) return animating
    ? { transform: direction === "next" ? "translateX(-30%)" : "translateX(30%)", opacity: 0, transition: "transform 420ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 420ms", zIndex: 1 }
    : { transform: "translateX(0)", opacity: 1, transition: "none", zIndex: 1 };
  return { transform: "translateX(100%)", opacity: 0, zIndex: 0, transition: "none" };
}

export default function ServiceclickHero() {
  const [slides, setSlides] = useState<SlideData[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${ADMIN_API}?action=banners`)
      .then(r => r.json())
      .then(d => {
        const active = (d.items || []).filter((b: { is_active: boolean }) => b.is_active);
        if (active.length > 0) {
          setSlides(active.map((b: {
            id: number; image_url: string; title: string; subtitle: string;
            button_text: string; bg_color: string; link: string; timer: number; effect: string;
          }) => ({
            id: b.id,
            image: b.image_url || "",
            title: b.title || "",
            subtitle: b.subtitle || "",
            button_text: b.button_text || "Подробнее",
            bg_color: b.bg_color || "linear-gradient(135deg, #c8d8f0 0%, #e0d0f8 100%)",
            link: b.link || "",
            timer: b.timer || 5000,
            effect: b.effect || "slide",
          })));
        }
      })
      .catch(() => {});
  }, []);

  const currentSlide = slides[current] || slides[0];
  const currentEffect = currentSlide?.effect || "slide";
  const currentTimer = currentSlide?.timer || 5000;
  const TOTAL = slides.length;

  const startProgress = (interval: number) => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    const step = 100 / (interval / 50);
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressRef.current!); return 100; }
        return p + step;
      });
    }, 50);
  };

  const ANIM_DURATION = currentEffect === "slide" ? 420 : currentEffect === "flip" ? 400 : 500;

  const goTo = (idx: number, dir: "next" | "prev") => {
    if (animating || TOTAL <= 1) return;
    setDirection(dir);
    setPrev(current);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setPrev(null);
      setAnimating(false);
    }, ANIM_DURATION);
    startProgress(currentTimer);
  };

  const handlePrev = () => { goTo((current - 1 + TOTAL) % TOTAL, "prev"); resetTimer(); };
  const handleNext = () => { goTo((current + 1) % TOTAL, "next"); resetTimer(); };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % TOTAL;
        setDirection("next");
        setPrev(c);
        setAnimating(true);
        setTimeout(() => { setPrev(null); setAnimating(false); }, ANIM_DURATION);
        startProgress(currentTimer);
        return next;
      });
    }, currentTimer);
  };

  useEffect(() => {
    startProgress(currentTimer);
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [slides, currentTimer]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-3 flex gap-3">
      {/* Main slider */}
      <div className="flex-1 relative rounded-3xl overflow-hidden min-w-0" style={{ height: 280, perspective: "1200px" }}>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 flex items-center"
            style={{
              background: slide.bg_color || "linear-gradient(135deg, #c8d8f0, #e0d0f8)",
              ...getSlideStyle(i, current, prev, animating, direction, slide.effect),
            }}
          >
            {/* Text */}
            <div className="flex flex-col justify-center pl-10 pr-4 z-10 flex-1">
              <h2 className="text-gray-900 text-2xl font-bold leading-tight mb-2 whitespace-pre-line">
                {slide.title}
              </h2>
              <p className="text-gray-600 text-sm mb-5 whitespace-pre-line leading-relaxed">
                {slide.subtitle}
              </p>
              {slide.button_text && (
                <a
                  href={slide.link || "#"}
                  className="flex items-center gap-0 w-fit overflow-hidden rounded-lg group"
                  onClick={!slide.link ? e => e.preventDefault() : undefined}
                >
                  <span className="bg-[#f47d20] text-white font-semibold text-sm px-5 py-2.5 group-hover:bg-[#e06a10] transition-colors">
                    {slide.button_text}
                  </span>
                  <span className="bg-[#d96a10] text-white px-3 py-2.5 flex items-center group-hover:bg-[#c05a08] transition-colors">
                    <Icon name="ChevronRight" size={16} />
                  </span>
                </a>
              )}
            </div>

            {/* Image */}
            {slide.image && (
              <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="max-h-[260px] max-w-full w-auto object-contain"
                />
              </div>
            )}
          </div>
        ))}

        {/* Counter + arrows */}
        {TOTAL > 1 && (
          <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-700 flex items-center justify-center shadow transition-colors">
                <Icon name="ChevronLeft" size={16} />
              </button>
              <span className="text-sm font-medium min-w-[44px] text-center">
                <span className="text-[#f47d20] font-bold">{current + 1}</span>
                <span className="text-gray-400"> / {TOTAL}</span>
              </span>
              <button onClick={handleNext} className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-700 flex items-center justify-center shadow transition-colors">
                <Icon name="ChevronRight" size={16} />
              </button>
            </div>
            <div className="w-[88px] h-[3px] bg-white/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f47d20] rounded-full"
                style={{ width: `${progress}%`, transition: progress === 0 ? "none" : "width 50ms linear" }}
              />
            </div>
          </div>
        )}

        {/* Dots */}
        {TOTAL > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? "next" : "prev")}
                className={`rounded-full transition-all ${i === current ? "w-5 h-2 bg-[#f47d20]" : "w-2 h-2 bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
        )}

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