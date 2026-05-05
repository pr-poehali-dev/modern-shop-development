import { useState } from "react";
import Icon from "@/components/ui/icon";

const categories = [
  { name: "Ноутбуки и компьютеры", icon: "Laptop" },
  { name: "Смартфоны и гаджеты", icon: "Smartphone" },
  { name: "ТВ и аудиотехника", icon: "Tv" },
  { name: "Бытовая техника", icon: "Refrigerator" },
  { name: "Фото и видео", icon: "Camera" },
  { name: "Игры и приставки", icon: "Gamepad2" },
  { name: "Климатическая техника", icon: "Wind" },
  { name: "Инструменты", icon: "Wrench" },
  { name: "Товары для дома", icon: "Home" },
  { name: "Канцелярия и офис", icon: "BookOpen" },
  { name: "Авто", icon: "Car" },
  { name: "Спорт и туризм", icon: "Bike" },
];

const navLinks = [
  "Акции",
  "Рассрочка 0%",
  "Трейд-ин",
  "Кредит",
  "Подписки",
  "Новинки",
  "Лизинг",
];

export default function CitilinkNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-[#e0e0e0] relative z-50">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center gap-6 h-11">
        {/* Catalog trigger */}
        <div className="relative">
          <button
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="flex items-center gap-2 font-semibold text-sm text-[#e31e24] hover:text-[#c41920] h-11 px-1"
          >
            <Icon name="LayoutGrid" size={16} />
            Каталог товаров
            <Icon name="ChevronDown" size={14} />
          </button>

          {/* Dropdown */}
          {open && (
            <div
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
              className="absolute top-11 left-0 bg-white border border-[#e0e0e0] shadow-xl rounded-b w-[260px] py-1 z-50"
            >
              {categories.map((cat) => (
                <a
                  key={cat.name}
                  href="#"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#f5f5f5] hover:text-[#e31e24] transition-colors"
                >
                  <Icon name={cat.icon} size={16} className="text-gray-500" />
                  {cat.name}
                  <Icon name="ChevronRight" size={14} className="ml-auto text-gray-400" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Nav links */}
        {navLinks.map((link) => (
          <a
            key={link}
            href="#"
            className={`text-sm h-11 flex items-center hover:text-[#e31e24] transition-colors whitespace-nowrap ${
              link === "Акции" || link === "Рассрочка 0%" ? "text-[#e31e24] font-semibold" : "text-gray-700"
            }`}
          >
            {link}
          </a>
        ))}
      </div>
    </nav>
  );
}