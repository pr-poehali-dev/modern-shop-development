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

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex gap-8 flex-col md:flex-row">
        {/* Image skeleton */}
        <div className="md:w-[360px] flex-shrink-0 flex flex-col gap-3">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: 480 }}>
            {/* Animated shimmer */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            {/* Decorative dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-300"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
          {/* Thumbnails skeleton */}
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden relative"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="flex-1 flex flex-col gap-4 pt-2">
          <div className="h-3 bg-gray-100 rounded-full w-1/3 animate-pulse" />
          <div className="space-y-2 mt-1">
            <div className="h-6 bg-gray-200 rounded-xl w-full animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-xl w-4/5 animate-pulse" />
          </div>
          <div className="h-3 bg-gray-100 rounded-full w-1/4 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-xl w-2/5 mt-2 animate-pulse" />
          <div className="flex flex-col gap-2 mt-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded-full flex-1 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                <div className="h-3 bg-gray-100 rounded-full w-12 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-12 bg-[#e31e24]/10 rounded-xl mt-4 animate-pulse" />
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse" />
            <div className="h-3 bg-gray-100 rounded-full w-5/6 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded-full w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
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

  const allImages = product
    ? product.images && product.images.length > 0
      ? product.images.slice(0, 7)
      : product.image
      ? [product.image]
      : []
    : [];

  const fallbackImg = `https://picsum.photos/seed/${id}/400/600`;
  const displayImg = allImages[activeImg] || product?.image || fallbackImg;

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2]">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
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
                <a href={`/catalog?category=${product.category_id}`} className="hover:text-[#e31e24] transition-colors">
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

          {loading && <ProductSkeleton />}

          {!loading && (error || !product) && (
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
              <Icon name="PackageX" size={48} className="text-gray-300" />
              <p className="text-gray-500 text-lg">Товар не найден</p>
              <button onClick={() => navigate("/catalog")} className="text-[#e31e24] hover:underline text-sm">
                Вернуться в каталог
              </button>
            </div>
          )}

          {!loading && product && (
            <div className="bg-white rounded-2xl p-6 mb-4">
              <div className="flex gap-8 flex-col md:flex-row">

                {/* Images column */}
                <div className="md:w-[360px] flex-shrink-0 flex flex-col gap-3">
                  {/* Main image — вертикальная, вытянутая */}
                  <div
                    className="relative rounded-3xl overflow-hidden bg-[#f8f8f8] flex items-center justify-center cursor-zoom-in"
                    style={{ height: 480 }}
                  >
                    <img
                      src={displayImg}
                      alt={product.name}
                      className="w-full h-full object-contain transition-opacity duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                    />
                    {discount && (
                      <span className="absolute top-3 left-3 bg-[#e31e24] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                        -{discount}%
                      </span>
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-3xl">
                        <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                          Нет в наличии
                        </span>
                      </div>
                    )}
                    {/* Стрелки навигации если несколько картинок */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImg((prev) => (prev - 1 + allImages.length) % allImages.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
                        >
                          <Icon name="ChevronLeft" size={16} className="text-gray-700" />
                        </button>
                        <button
                          onClick={() => setActiveImg((prev) => (prev + 1) % allImages.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
                        >
                          <Icon name="ChevronRight" size={16} className="text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails под основной картинкой */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                            i === activeImg
                              ? "border-[#e31e24] shadow-md scale-105"
                              : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Фото ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info column */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#e31e24] transition-colors self-start"
                  >
                    <Icon name="ArrowLeft" size={16} />
                    Назад
                  </button>

                  <h1 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>

                  {product.sku && (
                    <p className="text-xs text-gray-400">Арт. {product.sku}</p>
                  )}

                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {product.price > 0 ? product.price.toLocaleString("ru") + " ₽" : "Цена по запросу"}
                    </span>
                    {product.old_price && product.old_price > product.price && (
                      <span className="text-base text-gray-400 line-through">
                        {product.old_price.toLocaleString("ru")} ₽
                      </span>
                    )}
                  </div>

                  {/* Stock by store */}
                  <div className="flex flex-col gap-1.5 mt-1 bg-[#f8f8f8] rounded-xl p-3">
                    {product.stock_by_store.map((s) => (
                      <div key={s.store_id} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.quantity > 0 ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm text-gray-600">{s.store_name}</span>
                        <span className={`text-sm font-medium ml-auto ${s.quantity > 0 ? "text-green-600" : "text-gray-400"}`}>
                          {s.quantity > 0 ? `${s.quantity} ${product.unit || "шт"}` : "Нет"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`mt-2 w-full text-base font-semibold py-3.5 rounded-xl transition-all ${
                      inCart
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-[#e31e24] hover:bg-[#c41920] text-white hover:shadow-md"
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

                  {/* Description */}
                  {product.description && (
                    <div className="mt-3 pt-4 border-t border-[#f0f0f0]">
                      <h2 className="text-sm font-semibold text-gray-800 mb-2">Описание</h2>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <ServiceclickFooter />
    </div>
  );
}
