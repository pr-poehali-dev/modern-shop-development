import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import CitilinkHeader from "@/components/CitilinkHeader";
import CitilinkNav from "@/components/CitilinkNav";
import CitilinkFooter from "@/components/CitilinkFooter";

export const PRODUCTS = [
  {
    id: 1,
    name: "Ноутбук Lenovo IdeaPad 3 15ALC6",
    price: 49990,
    oldPrice: 62990,
    rating: 4.7,
    reviews: 234,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/94037c4d-73ce-4b5b-84df-b945f301fe10.jpg",
    badge: "Хит продаж",
    badgeColor: "#e31e24",
    brand: "Lenovo",
    category: "Ноутбуки",
    description: "Универсальный ноутбук для работы и учёбы. Производительный процессор, яркий экран и длительное время автономной работы делают его отличным выбором для повседневных задач.",
    specs: [
      { label: "Процессор", value: "AMD Ryzen 5 5500U" },
      { label: "ОЗУ", value: "8 ГБ DDR4" },
      { label: "Накопитель", value: "SSD 512 ГБ" },
      { label: "Дисплей", value: "15.6\", 1920×1080, IPS" },
      { label: "Видеокарта", value: "AMD Radeon Graphics" },
      { label: "Батарея", value: "45 Вт·ч, до 7 часов" },
      { label: "ОС", value: "Windows 11 Home" },
      { label: "Цвет", value: "Серый" },
    ],
  },
  {
    id: 2,
    name: "Смартфон Samsung Galaxy A55 8/256GB",
    price: 34999,
    oldPrice: 42999,
    rating: 4.8,
    reviews: 512,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/fdd16d79-39dd-4bf1-9217-a99a6eb4949b.jpg",
    badge: "Скидка 18%",
    badgeColor: "#e31e24",
    brand: "Samsung",
    category: "Смартфоны",
    description: "Флагманский смартфон среднего класса с отличной камерой, ярким AMOLED дисплеем и мощным процессором. Поддержка 5G и быстрая зарядка.",
    specs: [
      { label: "Процессор", value: "Exynos 1480" },
      { label: "ОЗУ", value: "8 ГБ" },
      { label: "Память", value: "256 ГБ" },
      { label: "Дисплей", value: "6.6\", Super AMOLED, 120 Гц" },
      { label: "Камера", value: "50 + 12 + 5 Мп" },
      { label: "Батарея", value: "5000 мА·ч" },
      { label: "ОС", value: "Android 14" },
      { label: "Цвет", value: "Синий" },
    ],
  },
  {
    id: 3,
    name: "Телевизор LG 55NANO756QA 55\"",
    price: 52990,
    oldPrice: null,
    rating: 4.6,
    reviews: 89,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/1fed0e77-3402-4c81-a16b-2a8660c68428.jpg",
    badge: "Новинка",
    badgeColor: "#388e3c",
    brand: "LG",
    category: "Телевизоры",
    description: "Большой телевизор с NanoCell технологией для точной цветопередачи. Smart TV на базе webOS с голосовым управлением и поддержкой 4K.",
    specs: [
      { label: "Диагональ", value: "55\"" },
      { label: "Разрешение", value: "3840×2160 (4K)" },
      { label: "Тип матрицы", value: "NanoCell IPS" },
      { label: "Частота обновления", value: "60 Гц" },
      { label: "Smart TV", value: "webOS 22" },
      { label: "HDR", value: "HDR10, HLG" },
      { label: "Звук", value: "20 Вт, 2.0" },
      { label: "Wi-Fi", value: "Есть" },
    ],
  },
  {
    id: 4,
    name: "Холодильник Haier A2F637CXMV",
    price: 68990,
    oldPrice: 79990,
    rating: 4.5,
    reviews: 156,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/1fed0e77-3402-4c81-a16b-2a8660c68428.jpg",
    badge: null,
    badgeColor: "",
    brand: "Haier",
    category: "Холодильники",
    description: "Просторный двухкамерный холодильник с системой No Frost. Инверторный компрессор обеспечивает тихую работу и экономию электроэнергии.",
    specs: [
      { label: "Тип", value: "Двухкамерный" },
      { label: "Общий объём", value: "430 л" },
      { label: "Объём морозилки", value: "110 л" },
      { label: "Система", value: "Full No Frost" },
      { label: "Класс энергопотребления", value: "A++" },
      { label: "Компрессор", value: "Инверторный" },
      { label: "Цвет", value: "Нержавеющая сталь" },
      { label: "Размеры (ВxШxГ)", value: "200×70×67 см" },
    ],
  },
  {
    id: 5,
    name: "Наушники Sony WH-1000XM5",
    price: 22990,
    oldPrice: 29990,
    rating: 4.9,
    reviews: 876,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/94037c4d-73ce-4b5b-84df-b945f301fe10.jpg",
    badge: "Хит продаж",
    badgeColor: "#e31e24",
    brand: "Sony",
    category: "Наушники",
    description: "Лучшие беспроводные наушники с активным шумоподавлением. До 30 часов музыки на одном заряде и кристально чистый звук.",
    specs: [
      { label: "Тип", value: "Накладные, полноразмерные" },
      { label: "Подключение", value: "Bluetooth 5.2" },
      { label: "Шумоподавление", value: "Активное (ANC)" },
      { label: "Время работы", value: "До 30 часов" },
      { label: "Зарядка", value: "USB-C, быстрая 3 мин = 3 ч" },
      { label: "Микрофон", value: "8 микрофонов" },
      { label: "Вес", value: "250 г" },
      { label: "Цвет", value: "Чёрный" },
    ],
  },
  {
    id: 6,
    name: "Планшет Apple iPad 10.9\" 64GB Wi-Fi",
    price: 44990,
    oldPrice: 49990,
    rating: 4.8,
    reviews: 341,
    image: "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/fdd16d79-39dd-4bf1-9217-a99a6eb4949b.jpg",
    badge: "Рассрочка",
    badgeColor: "#1565c0",
    brand: "Apple",
    category: "Планшеты",
    description: "iPad нового поколения с чипом A14 Bionic, ярким Liquid Retina дисплеем и поддержкой Apple Pencil. Идеален для работы, учёбы и творчества.",
    specs: [
      { label: "Процессор", value: "Apple A14 Bionic" },
      { label: "Память", value: "64 ГБ" },
      { label: "Дисплей", value: "10.9\", Liquid Retina, 2360×1640" },
      { label: "Камера", value: "12 Мп Wide + 12 Мп Ultra Wide" },
      { label: "Батарея", value: "28.65 Вт·ч, до 10 часов" },
      { label: "ОС", value: "iPadOS 16" },
      { label: "Подключение", value: "Wi-Fi 6, Bluetooth 5.2" },
      { label: "Цвет", value: "Серебристый" },
    ],
  },
];

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name="Star"
          size={size}
          className={s <= Math.round(rating) ? "text-[#ffc107] fill-[#ffc107]" : "text-gray-300 fill-gray-300"}
        />
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inCart, setInCart] = useState(false);
  const [inFav, setInFav] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "specs">("specs");

  const product = PRODUCTS.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <CitilinkHeader />
        <CitilinkNav />
        <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
          Товар не найден
        </div>
        <CitilinkFooter />
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2]">
      <CitilinkHeader />
      <CitilinkNav />

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 py-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
            <a href="/" className="hover:text-[#e31e24] transition-colors">Главная</a>
            <Icon name="ChevronRight" size={12} />
            <a href="#" className="hover:text-[#e31e24] transition-colors">{product.category}</a>
            <Icon name="ChevronRight" size={12} />
            <span className="text-gray-700 truncate max-w-[300px]">{product.name}</span>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl p-6 mb-4">
            <div className="flex gap-8">

              {/* Image */}
              <div className="w-[400px] flex-shrink-0">
                <div className="relative rounded-2xl overflow-hidden bg-[#f8f8f8] flex items-center justify-center" style={{ height: 360 }}>
                  {product.badge && (
                    <span
                      className="absolute top-3 left-3 text-white text-xs font-semibold px-2.5 py-1 rounded-lg z-10"
                      style={{ background: product.badgeColor }}
                    >
                      {product.badge}
                    </span>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>
                  <button
                    onClick={() => setInFav(!inFav)}
                    className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                      inFav ? "border-[#e31e24] text-[#e31e24] bg-red-50" : "border-gray-200 text-gray-400 hover:border-[#e31e24] hover:text-[#e31e24]"
                    }`}
                  >
                    <Icon name="Heart" size={18} />
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={product.rating} />
                  <span className="text-sm font-semibold text-gray-800">{product.rating}</span>
                  <span className="text-sm text-gray-400">{product.reviews} отзывов</span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-sm text-gray-500">Бренд: <a href="#" className="text-[#e31e24] hover:underline">{product.brand}</a></span>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-gray-900">
                      {product.price.toLocaleString("ru")} ₽
                    </span>
                    {discount && (
                      <span className="bg-[#e31e24] text-white text-sm font-bold px-2 py-0.5 rounded-lg mb-1">
                        −{discount}%
                      </span>
                    )}
                  </div>
                  {product.oldPrice && (
                    <p className="text-sm text-gray-400 line-through mt-0.5">
                      {product.oldPrice.toLocaleString("ru")} ₽
                    </p>
                  )}
                </div>

                {/* Delivery info */}
                <div className="flex flex-col gap-2 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Icon name="Truck" size={16} className="text-[#e31e24]" />
                    <span>Доставка завтра при заказе до 18:00</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Icon name="MapPin" size={16} className="text-[#e31e24]" />
                    <span>Самовывоз сегодня — 42 магазина</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Icon name="ShieldCheck" size={16} className="text-[#e31e24]" />
                    <span>Гарантия 12 месяцев</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => setInCart(!inCart)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
                      inCart
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-[#e31e24] hover:bg-[#c41920] text-white"
                    }`}
                  >
                    <Icon name={inCart ? "Check" : "ShoppingCart"} size={18} />
                    {inCart ? "В корзине" : "В корзину"}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 border-[#e31e24] text-[#e31e24] hover:bg-red-50 transition-colors">
                    Купить в 1 клик
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="flex border-b border-gray-100">
              {([["specs", "Характеристики"], ["desc", "Описание"]] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === key
                      ? "border-[#e31e24] text-[#e31e24]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "specs" && (
                <div className="grid grid-cols-2 gap-x-12 gap-y-0">
                  {product.specs.map((s, i) => (
                    <div key={i} className="flex justify-between py-2.5 border-b border-gray-50">
                      <span className="text-sm text-gray-500">{s.label}</span>
                      <span className="text-sm text-gray-900 font-medium text-right">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "desc" && (
                <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">{product.description}</p>
              )}
            </div>
          </div>

        </div>
      </main>

      <CitilinkFooter />
    </div>
  );
}
