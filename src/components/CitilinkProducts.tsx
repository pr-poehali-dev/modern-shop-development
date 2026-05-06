import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const products = [
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
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name="Star"
          size={12}
          className={s <= Math.round(rating) ? "text-[#ffc107] fill-[#ffc107]" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export default function ServiceclickProducts() {
  const navigate = useNavigate();
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">Популярные товары</h2>
        <a href="#" className="text-sm text-[#e31e24] hover:underline flex items-center gap-1">
          Все товары <Icon name="ChevronRight" size={14} />
        </a>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/product/${p.id}`)}
            className="bg-white rounded-2xl border border-[#e0e0e0] hover:border-[#e31e24] hover:shadow-md transition-all cursor-pointer group flex flex-col overflow-hidden"
          >
            {/* Image */}
            <div className="relative">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-36 object-cover rounded-t"
              />
              {p.badge && (
                <span
                  className="absolute top-2 left-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: p.badgeColor }}
                >
                  {p.badge}
                </span>
              )}
              <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#e31e24]">
                <Icon name="Heart" size={14} />
              </button>
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col flex-1">
              <p className="text-xs text-gray-800 leading-tight line-clamp-2 mb-2 flex-1">{p.name}</p>

              <div className="flex items-center gap-1 mb-2">
                <StarRating rating={p.rating} />
                <span className="text-[10px] text-gray-500">({p.reviews})</span>
              </div>

              <div className="mb-2">
                <p className="text-base font-bold text-gray-900">{p.price.toLocaleString("ru")} ₽</p>
                {p.oldPrice && (
                  <p className="text-xs text-gray-400 line-through">{p.oldPrice.toLocaleString("ru")} ₽</p>
                )}
              </div>

              <button className="w-full bg-[#e31e24] hover:bg-[#c41920] text-white text-xs font-semibold py-2 rounded transition-colors flex items-center justify-center gap-1">
                <Icon name="ShoppingCart" size={13} />
                В корзину
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}