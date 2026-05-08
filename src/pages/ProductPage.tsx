import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickFooter from "@/components/ServiceclickFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLocationStores } from "@/hooks/useVisibleStores";

const PRODUCT_API_URL = "https://functions.poehali.dev/42cc11fa-0fb5-41fd-a771-fc9811521293";

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
  const { addToCart, items, cartStoreId } = useCart();
  const visibleStoreIds = useLocationStores();

  const [adding, setAdding] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const inCart = items.some((i) => i.product_id === String(id));
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${PRODUCT_API_URL}?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) setProduct(data.product);
        else setError(data.error || "Товар не найден");
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const discount =
    product?.old_price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : null;

  // Автогенерация характеристик из названия/категории
  const autoSpecs = useMemo(() => {
    if (!product) return [];
    const specs: { label: string; value: string }[] = [];
    specs.push({ label: "Артикул", value: product.sku || "—" });
    specs.push({ label: "Категория", value: product.category_name || "—" });
    specs.push({ label: "Единица", value: product.unit || "шт" });
    if (product.in_stock) specs.push({ label: "Наличие", value: "В наличии" });
    // Дополнительные из названия
    const name = product.name.toLowerCase();
    if (name.includes("gb") || name.includes("гб")) {
      const match = product.name.match(/(\d+)\s*(gb|гб)/i);
      if (match) specs.push({ label: "Память", value: match[0] });
    }
    if (name.includes("ghz") || name.includes("ггц")) {
      const match = product.name.match(/[\d.]+\s*(ghz|ггц)/i);
      if (match) specs.push({ label: "Частота", value: match[0] });
    }
    if (name.includes('"') || name.includes("дюйм")) {
      const match = product.name.match(/[\d.]+["″]/);
      if (match) specs.push({ label: "Диагональ", value: match[0] });
    }
    specs.push({ label: "Гарантия", value: "12 месяцев" });
    specs.push({ label: "Страна", value: "Китай / Корея" });
    return specs;
  }, [product]);

  const allImages = product
    ? product.images && product.images.length > 0
      ? product.images.slice(0, 7)
      : product.image
      ? [product.image]
      : []
    : [];

  const fallbackImg = `https://picsum.photos/seed/${id}/400/600`;

  // Добиваем до 7 фото через picsum с разными seed если реальных меньше
  const filledImages = (() => {
    if (!product) return [];
    const seeds = ["a", "b", "c", "d", "e", "f", "g"];
    const base = allImages.length > 0 ? allImages : [product.image || fallbackImg];
    const extras: string[] = [];
    for (let i = 0; extras.length + base.length < 7; i++) {
      extras.push(`https://picsum.photos/seed/${id}${seeds[i]}/400/600`);
    }
    return [...base, ...extras].slice(0, 7);
  })();

  const displayImg = filledImages[activeImg] || fallbackImg;

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
                    {/* Стрелки навигации */}
                    {filledImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImg((prev) => (prev - 1 + filledImages.length) % filledImages.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
                        >
                          <Icon name="ChevronLeft" size={16} className="text-gray-700" />
                        </button>
                        <button
                          onClick={() => setActiveImg((prev) => (prev + 1) % filledImages.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
                        >
                          <Icon name="ChevronRight" size={16} className="text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails под основной картинкой */}
                  <div className="flex gap-2 flex-wrap">
                    {filledImages.map((img, i) => (
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

                  {/* Stock by store — выбор склада */}
                  {(() => {
                    const filteredStock = visibleStoreIds && visibleStoreIds.length > 0
                      ? product.stock_by_store.filter(s => visibleStoreIds.includes(s.store_id))
                      : product.stock_by_store;
                    if (filteredStock.length === 0) return null;
                    return (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500 mb-1.5 font-medium">Выберите склад для заказа:</p>
                        <div className="flex flex-col gap-1.5">
                          {filteredStock.map((s) => {
                            const isSelected = selectedStoreId === s.store_id;
                            const isCartStore = cartStoreId !== null && cartStoreId === s.store_id;
                            const conflictWithCart = cartStoreId !== null && cartStoreId !== s.store_id && items.length > 0;
                            return (
                              <button
                                key={s.store_id}
                                disabled={inCart || s.quantity <= 0}
                                onClick={() => {
                                  if (s.quantity > 0 && !inCart) {
                                    setSelectedStoreId(isSelected ? null : s.store_id);
                                    setConflictMsg(null);
                                  }
                                }}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                                  s.quantity <= 0
                                    ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                    : isSelected
                                    ? "border-[#e31e24] bg-red-50"
                                    : conflictWithCart
                                    ? "border-orange-200 bg-orange-50 cursor-pointer hover:border-orange-300"
                                    : "border-gray-100 bg-[#f8f8f8] cursor-pointer hover:border-gray-300"
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? "border-[#e31e24] bg-[#e31e24]" : "border-gray-300"
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className={`text-sm flex-1 ${isSelected ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                  {s.store_name}
                                  {isCartStore && <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">текущий склад корзины</span>}
                                  {conflictWithCart && !isCartStore && <span className="ml-1.5 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">другой склад</span>}
                                </span>
                                <span className={`text-sm font-medium ml-auto flex-shrink-0 ${s.quantity > 0 ? "text-green-600" : "text-gray-400"}`}>
                                  {s.quantity > 0 ? `${s.quantity} ${product.unit || "шт"}` : "Нет"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {conflictMsg && (
                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 text-sm text-orange-700">
                      <Icon name="AlertTriangle" size={16} className="flex-shrink-0 mt-0.5" />
                      <span>В корзине уже есть товары со склада <b>{conflictMsg}</b>. Очистите корзину или выберите тот же склад.</span>
                    </div>
                  )}

                  <button
                    className={`mt-2 w-full text-base font-semibold py-3.5 rounded-xl transition-all ${
                      inCart
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : selectedStoreId !== null
                        ? "bg-[#e31e24] hover:bg-[#c41920] text-white hover:shadow-md"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={adding || (!inCart && selectedStoreId === null)}
                    onClick={async () => {
                      if (!user) { navigate("/login", { state: { from: `/product/${id}` } }); return; }
                      if (inCart) { navigate("/cart"); return; }
                      if (!selectedStoreId) return;
                      setAdding(true);
                      setConflictMsg(null);
                      try {
                        const selectedStore = product.stock_by_store.find(s => s.store_id === selectedStoreId);
                        const result = await addToCart({
                          id: product.id, name: product.name, price: product.price,
                          image: product.image, sku: product.sku, unit: product.unit,
                          store_id: selectedStoreId,
                          store_name: selectedStore?.store_name || null,
                          max_quantity: selectedStore?.quantity ?? null,
                          stock_by_store: product.stock_by_store,
                        });
                        if (!result.ok && result.conflictStore) {
                          setConflictMsg(result.conflictStore);
                        }
                      } finally { setAdding(false); }
                    }}
                  >
                    {adding ? "Добавляю..." : inCart ? "Перейти в корзину →" : selectedStoreId ? "В корзину" : "Выберите склад"}
                  </button>

                  {/* Быстрые характеристики */}
                  <div className="mt-3 pt-3 border-t border-[#f0f0f0] grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {autoSpecs.slice(0, 6).map((s) => (
                      <div key={s.label} className="flex flex-col">
                        <span className="text-[11px] text-gray-400">{s.label}</span>
                        <span className="text-xs font-medium text-gray-700">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Блок описания и характеристик */}
          {!loading && product && (
            <div className="bg-white rounded-2xl mb-4 overflow-hidden">
              {/* Вкладки */}
              <div className="flex border-b border-gray-100">
                {(["description", "specs"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-[#e31e24] text-gray-900"
                        : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {tab === "description" ? "Описание" : "Характеристики"}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "description" && (
                  <div className="max-w-3xl">
                    {product.description ? (
                      <p className="text-sm text-gray-700 leading-7 whitespace-pre-line">{product.description}</p>
                    ) : (
                      <div className="text-sm text-gray-600 leading-7 space-y-4">
                        <p>
                          <strong>{product.name}</strong> — надёжное решение для дома и работы. Продуманная конструкция
                          обеспечивает долговечность и удобство использования каждый день.
                        </p>
                        <p>
                          Устройство отличается высокой производительностью и современным дизайном.
                          Подходит как для профессионального использования, так и для повседневных задач.
                        </p>
                        <p>
                          Все товары в нашем каталоге проходят проверку качества и поставляются с официальной гарантией.
                          Мы работаем напрямую с производителями, что гарантирует подлинность продукции.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="max-w-2xl">
                    <table className="w-full text-sm">
                      <tbody>
                        {autoSpecs.map((s, i) => (
                          <tr key={s.label} className={i % 2 === 0 ? "bg-[#f8f8f8]" : "bg-white"}>
                            <td className="px-4 py-2.5 text-gray-500 font-medium w-1/2 rounded-l-lg">{s.label}</td>
                            <td className="px-4 py-2.5 text-gray-800 rounded-r-lg">{s.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <ServiceclickFooter />
    </div>
  );
}