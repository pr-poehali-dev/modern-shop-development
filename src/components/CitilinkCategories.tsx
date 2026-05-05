import Icon from "@/components/ui/icon";

const categories = [
  { name: "Ноутбуки", icon: "Laptop", color: "#e8f0fe" },
  { name: "Смартфоны", icon: "Smartphone", color: "#fce8e6" },
  { name: "Телевизоры", icon: "Tv", color: "#e6f4ea" },
  { name: "Холодильники", icon: "Refrigerator", color: "#fff3e0" },
  { name: "Стиральные машины", icon: "WashingMachine", color: "#f3e5f5" },
  { name: "Планшеты", icon: "Tablet", color: "#e0f7fa" },
  { name: "Наушники", icon: "Headphones", color: "#fff9c4" },
  { name: "Фотоаппараты", icon: "Camera", color: "#fce4ec" },
  { name: "Игровые консоли", icon: "Gamepad2", color: "#e8eaf6" },
  { name: "Принтеры", icon: "Printer", color: "#e0f2f1" },
  { name: "Пылесосы", icon: "Wind", color: "#fff8e1" },
  { name: "Климатическая\nтехника", icon: "AirVent", color: "#e3f2fd" },
];

export default function CitilinkCategories() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Популярные категории</h2>
      <div className="grid grid-cols-6 gap-3">
        {categories.map((cat) => (
          <a
            key={cat.name}
            href="#"
            className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow group border border-transparent hover:border-[#e31e24]"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: cat.color }}
            >
              <Icon name={cat.icon} size={24} className="text-gray-700 group-hover:text-[#e31e24] transition-colors" />
            </div>
            <span className="text-xs text-center text-gray-700 leading-tight group-hover:text-[#e31e24] transition-colors whitespace-pre-line">
              {cat.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}