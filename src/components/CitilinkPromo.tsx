const promoBanners = [
  {
    title: "Рассрочка 0%",
    sub: "на 12 месяцев без переплат",
    cta: "Узнать подробнее",
    bg: "#1565c0",
    text: "white",
  },
  {
    title: "Скидки до 50%",
    sub: "Распродажа складских остатков",
    cta: "Смотреть товары",
    bg: "#e31e24",
    text: "white",
  },
  {
    title: "Трейд-ин",
    sub: "Сдайте старое — купите новое дешевле",
    cta: "Оценить устройство",
    bg: "#1a1a1a",
    text: "white",
  },
];

export default function CitilinkPromo() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="grid grid-cols-3 gap-3">
        {promoBanners.map((b, i) => (
          <div
            key={i}
            className="rounded p-6 flex flex-col justify-between h-[140px] cursor-pointer hover:opacity-95 transition-opacity"
            style={{ background: b.bg, color: b.text }}
          >
            <div>
              <p className="font-bold text-xl">{b.title}</p>
              <p className="text-sm opacity-80 mt-1">{b.sub}</p>
            </div>
            <span className="text-sm font-semibold border border-current/40 rounded px-3 py-1 w-fit hover:bg-white/10 transition-colors">
              {b.cta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
