import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickFooter from "@/components/ServiceclickFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const API_URL = "https://functions.poehali.dev/c7265605-961b-48cb-9594-4caad2cb333e";

interface StockEntry {
  store_id: number;
  store_name: string;
  quantity: number;
}

interface Product {
  id: string | number;
  name: string;
  price: number;
  old_price: number | null;
  image: string;
  images?: string[];
  category_id: string | number;
  category_name: string;
  sku: string;
  unit: string;
  description: string;
  in_stock: boolean;
  stock_by_store: StockEntry[];
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const [adding, setAdding] = useState(false);
  const inCart = items.some((i) => i.product_id === String(id));
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    // Ищем товар по ID среди всех товаров (перебираем страницы)
    const findProduct = async () => {
      for (let page = 1; page <= 20; page++) {
        const res = await fetch(`${API_URL}?action=products&page=${page}&per_page=500`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        const found = (data.items || []).find((p: Product) => String(p.id) === String(id));
        if (found) return found;
        if (page >= (data.pages || 1)) break;
      }
      return null;
    };
    findProduct()
      .then((found) => {
        if (found) setProduct(found);
        else setError("Товар не найден");
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const discount =
    product?.old_price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : null;

  const allImages =
    product
      ? [
          ...(product.images && product.images.length > 0
            ? product.images
            : product.image
            ? [product.image]
            : []),
        ]
      : [];
  const fallbackImg = `https://picsum.photos/seed/${id}/400/400`;
  const displayImg = allImages[activeImg] || product?.image || fallbackImg;

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2]">
      <ServiceclickHeader />
      <ServiceclickNav />

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 py-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
            <a href="/" className="hover:text-[#e31e24] transition-colors">Главная</a>
            <Icon name="ChevronRight" size={12} />
            <a href="/catalog" className="hover:text-[#e31e24] transition-colors">Каталог</a>
            {product?.category_name && (
              <>
                <Icon name="ChevronRight" size={12} />
                <a
                  href={`/catalog?category=${product.category_id}`}
                  className="hover:text-[#e31e24] transition-colors"
                >
                  {product.category_name}
                </a>
              </>
            )}
            {product?.name && (
              <>
                <Icon name="ChevronRight" size={12} />
                <span className="text-gray-700 truncate max-w-[300px]">{product.name}</span>
              </>
            )}
          </div>

          {loading && (
            <div className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="flex gap-8">
                <div className="w-[400px] h-[360px] bg-gray-100 rounded-2xl flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-4 pt-2">
                  <div className="h-6 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-10 bg-gray-100 rounded w-1/3 mt-4" />
                  <div className="h-12 bg-gray-100 rounded-xl mt-4" />
                </div>
              </div>
            </div>
          )}

          {!loading && (error || !product) && (
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
              <Icon name="PackageX" size={48} className="text-gray-300" />
              <p className="text-gray-500 text-lg">Товар не найден</p>
              <button
                onClick={() => navigate("/catalog")}
                className="text-[#e31e24] hover:underline text-sm"
              >
                Вернуться в каталог
              </button>
            </div>
          )}

          {!loading && product && (
            <>
              {/* Main card */}
              <div className="bg-white rounded-2xl p-6 mb-4">
                <div className="flex gap-8 flex-col md:flex-row">

                  {/* Images */}
                  <div className="md:w-[400px] flex-shrink-0 flex flex-col gap-3">
                    <div
                      className="relative rounded-2xl overflow-hidden bg-[#f8f8f8] flex items-center justify-center"
                      style={{ height: 360 }}
                    >
                      <img
                        src={displayImg}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                      />
                      {discount && (
                        <span className="absolute top-3 left-3 bg-[#e31e24] text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      {!product.in_stock && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                            Нет в наличии
                          </span>
                        </div>
                      )}
                    </div>
                    {allImages.length > 1 && (
                      <div className="flex gap-2 flex-wrap">
                        {allImages.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                              i === activeImg ? "border-[#e31e24]" : "border-[#e8e8e8] hover:border-gray-400"
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-3">
                    <button
                      onClick={() => navigate(-1)}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#e31e24] transition-colors self-start"
                    >
                      <Icon name="ArrowLeft" size={16} />
                      Назад
                    </button>

                    <h1 className="text-xl font-bold text-gray-900 leading-snug">
                      {product.name}
                    </h1>

                    {product.sku && (
                      <p className="text-xs text-gray-400">Арт. {product.sku}</p>
                    )}

                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {product.price > 0
                          ? product.price.toLocaleString("ru") + " ₽"
                          : "Цена по запросу"}
                      </span>
                      {product.old_price && product.old_price > product.price && (
                        <span className="text-base text-gray-400 line-through">
                          {product.old_price.toLocaleString("ru")} ₽
                        </span>
                      )}
                    </div>

                    {/* Stock by store */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      {product.stock_by_store.map((s) => (
                        <div key={s.store_id} className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              s.quantity > 0 ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span className="text-sm text-gray-600">{s.store_name}</span>
                          <span
                            className={`text-sm font-medium ml-auto ${
                              s.quantity > 0 ? "text-green-600" : "text-gray-400"
                            }`}
                          >
                            {s.quantity > 0 ? `${s.quantity} ${product.unit || "шт"}` : "Нет"}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      className={`mt-4 w-full text-base font-semibold py-3 rounded-xl transition-colors ${
                        inCart ? "bg-green-500 hover:bg-green-600 text-white" : "bg-[#e31e24] hover:bg-[#c41920] text-white"
                      }`}
                      disabled={adding}
                      onClick={async () => {
                        if (!user) { navigate("/login", { state: { from: `/product/${id}` } }); return; }
                        if (inCart) { navigate("/cart"); return; }
                        setAdding(true);
                        try {
                          await addToCart({
                            id: product.id, name: product.name, price: product.price,
                            image: product.image, sku: product.sku, unit: product.unit,
                          });
                        } finally { setAdding(false); }
                      }}
                    >
                      {adding ? "Добавляю..." : inCart ? "Перейти в корзину →" : "В корзину"}
                    </button>

                    {product.description && (
                      <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                        <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <ServiceclickFooter />
    </div>
  );
}