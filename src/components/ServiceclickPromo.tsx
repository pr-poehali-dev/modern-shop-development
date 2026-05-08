import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const promoBanners = [
  {
    title: "Рассрочка 0%",
    sub: "На 12 месяцев без переплат и скрытых комиссий",
    cta: "Узнать подробнее",
    bg: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
    accent: "#42a5f5",
    icon: "CreditCard",
    badge: "0%",
    badgeLabel: "переплата",
    href: "/catalog",
  },
  {
    title: "Скидки до 50%",
    sub: "Распродажа складских остатков — только пока есть",
    cta: "Смотреть товары",
    bg: "linear-gradient(135deg, #c62828 0%, #e31e24 100%)",
    accent: "#ef9a9a",
    icon: "Tag",
    badge: "−50%",
    badgeLabel: "скидка",
    href: "/catalog",
  },
  {
    title: "Трейд-ин",
    sub: "Сдайте старое устройство — купите новое дешевле",
    cta: "Оценить устройство",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    accent: "#f47d20",
    icon: "RefreshCw",
    badge: "выгода",
    badgeLabel: "до 30 000 ₽",
    href: "/catalog",
  },
];

export default function ServiceclickPromo() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="grid grid-cols-3 gap-3">
        {promoBanners.map((b, i) => (
          <div
            key={i}
            onClick={() => navigate(b.href)}
            className="rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden relative"
            style={{ background: b.bg, minHeight: 160 }}
          >
            {/* Фоновый декор-круг */}
            <div
              className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10"
              style={{ background: b.accent }}
            />
            <div
              className="absolute -right-2 bottom-4 w-20 h-20 rounded-full opacity-10"
              style={{ background: b.accent }}
            />

            {/* Бейдж */}
            <div className="flex items-start justify-between relative z-10">
              <div
                className="rounded-xl px-3 py-1.5 flex flex-col items-center leading-tight"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <span className="text-white font-extrabold text-xl leading-none">{b.badge}</span>
                <span className="text-white/70 text-[10px] font-medium">{b.badgeLabel}</span>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <Icon name={b.icon} size={20} className="text-white" />
              </div>
            </div>

            {/* Текст */}
            <div className="relative z-10 mt-3">
              <p className="font-bold text-white text-lg leading-tight">{b.title}</p>
              <p className="text-white/70 text-xs mt-1 leading-snug">{b.sub}</p>
            </div>

            {/* CTA */}
            <div className="relative z-10 mt-4">
              <span
                className="text-xs font-semibold text-white border border-white/30 rounded-lg px-4 py-1.5 inline-flex items-center gap-1.5 hover:bg-white/10 transition-colors"
              >
                {b.cta}
                <Icon name="ChevronRight" size={13} className="text-white" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}