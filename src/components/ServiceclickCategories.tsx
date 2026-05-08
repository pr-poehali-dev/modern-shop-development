import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const categories = [
  { name: "Ноутбуки", icon: "Laptop", color: "#fff3e0", iconColor: "#f47d20", slug: "Ноутбуки" },
  { name: "Смартфоны", icon: "Smartphone", color: "#fff3e0", iconColor: "#f47d20", slug: "Смартфоны" },
  { name: "Телевизоры", icon: "Tv", color: "#fff3e0", iconColor: "#f47d20", slug: "Телевизоры" },
  { name: "Комплектующие для ПК", icon: "Cpu", color: "#fff3e0", iconColor: "#f47d20", slug: "Комплектующие" },
  { name: "Строительство и ремонт", icon: "Hammer", color: "#fff3e0", iconColor: "#f47d20", slug: "Строительство" },
  { name: "Цифровые товары", icon: "Cloud", color: "#fff3e0", iconColor: "#f47d20", slug: "Цифровые" },
  { name: "Товары для геймеров", icon: "Gamepad2", color: "#fff3e0", iconColor: "#f47d20", slug: "Геймеры" },
  { name: "Техника для дома", icon: "WashingMachine", color: "#fff3e0", iconColor: "#f47d20", slug: "Техника" },
  { name: "Товары для кухни", icon: "UtensilsCrossed", color: "#fff3e0", iconColor: "#f47d20", slug: "Кухня" },
  { name: "Садовая техника", icon: "Flower2", color: "#fff3e0", iconColor: "#f47d20", slug: "Садовая" },
];

export default function ServiceclickCategories() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="bg-white rounded-2xl px-5 py-5">
        {/* Заголовок */}
        <div className="flex items-center gap-6 mb-5 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-900 pb-3 -mb-4 cursor-pointer">
            Популярные категории
          </h2>
          <span className="text-xl font-bold text-gray-400 pb-3 -mb-4 cursor-pointer hover:text-gray-600 transition-colors">
            Бизнесу
          </span>
        </div>

        {/* Сетка категорий */}
        <div className="grid grid-cols-5 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => navigate(`/catalog?search=${encodeURIComponent(cat.slug)}`)}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-[#f47d20] hover:shadow-sm transition-all bg-white text-left"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors"
                style={{ background: cat.color }}
              >
                <Icon
                  name={cat.icon}
                  size={32}
                  className="transition-colors"
                  style={{ color: cat.iconColor }}
                />
              </div>
              <span className="text-sm text-gray-700 text-center leading-snug group-hover:text-[#f47d20] transition-colors">
                {cat.name} →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
