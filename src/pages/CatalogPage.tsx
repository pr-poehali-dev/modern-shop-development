import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickFooter from "@/components/ServiceclickFooter";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLocationStores } from "@/hooks/useVisibleStores";

const API_URL = "https://functions.poehali.dev/c7265605-961b-48cb-9594-4caad2cb333e";
const USER_API_URL = "https://functions.poehali.dev/ef02c3ce-d482-422a-9426-60d8f91b4b86";
const PER_PAGE = 24;



interface StockEntry {
  store_id: number;
  store_name: string;
  quantity: number;
}

interface Store {
  id: number;
  name: string;
  main: boolean;
}

interface Product {
  id: string | number;
  name: string;
  price: number;
  old_price: number | null;
  image: string;
  category_id: string | number;
  category_name: string;
  sku: string;
  unit: string;
  description: string;
  in_stock: boolean;
  stock_by_store: StockEntry[];
}

interface Category {
  id: string | number;
  name: string;
  parent_id: string | number | null;
  count: number;
}

function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { user, token } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Введите имя"); return; }
    if (!phone.trim()) { setError("Введите телефон"); return; }
    setLoading(true);
    try {
      const res = await fetch(USER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
        body: JSON.stringify({
          action: "request.create",
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          product_id: String(product.id),
          product_name: product.name,
          product_sku: product.sku,
          product_price: product.price,
          quantity,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setSuccess(true);
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-base leading-snug pr-4">Заказ товара под запрос</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <Icon name="X" size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="CheckCircle" size={28} className="text-green-500" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Заявка принята!</p>
            <p className="text-sm text-gray-500">Менеджер свяжется с вами в ближайшее время.</p>
            <button onClick={onClose} className="mt-5 px-6 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors">
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Если товара нет в наличии в нашем интернет каталоге, он может быть на основном складе. Укажите ваши контактные данные и нужное количество. Наш менеджер уточнит наличие и вам перезвонит.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 flex gap-3 items-center mb-4">
              {product.image && (
                <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
                {product.sku && <p className="text-xs text-gray-400 mt-0.5">Арт. {product.sku}</p>}
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {product.price > 0 ? product.price.toLocaleString("ru") + " ₽" : "Цена по запросу"}
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#e31e24]"
              />
              <input
                type="tel"
                placeholder="Телефон"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#e31e24]"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 flex-shrink-0">Количество:</span>
                <div className="flex items-center gap-1 border border-[#e8e8e8] rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-500 hover:bg-gray-50 text-sm">−</button>
                  <span className="px-3 text-sm font-medium text-gray-800 min-w-[2rem] text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-500 hover:bg-gray-50 text-sm">+</button>
                </div>
                <span className="text-sm text-gray-400">{product.unit || "шт"}</span>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#e31e24] hover:bg-[#c41920] text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {loading ? "Отправляю..." : "Заказать"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, visibleStoreIds }: { product: Product; visibleStoreIds: number[] | null }) {
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const inCart = items.some((i) => i.product_id === String(product.id));

  // Фильтруем склады по настройкам видимости
  const filteredStock = visibleStoreIds && visibleStoreIds.length > 0
    ? product.stock_by_store?.filter(s => visibleStoreIds.includes(s.store_id))
    : product.stock_by_store;
  const isInStock = filteredStock?.some(s => s.quantity > 0) ?? false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login", { state: { from: "/catalog" } }); return; }
    if (inCart) { navigate("/cart"); return; }

    // Если есть только один склад с товаром — добавляем сразу
    const availableStores = (filteredStock || []).filter(s => s.quantity > 0);
    if (availableStores.length === 1) {
      setAdding(true);
      try {
        await addToCart({
          id: product.id, name: product.name, price: product.price,
          image: product.image, sku: product.sku, unit: product.unit,
          store_id: availableStores[0].store_id,
          store_name: availableStores[0].store_name,
          max_quantity: availableStores[0].quantity,
          stock_by_store: product.stock_by_store,
        });
      } finally {
        setAdding(false);
      }
    } else {
      // Несколько складов — переходим на карточку товара для выбора
      navigate(`/product/${product.id}`);
    }
  };

  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : null;

  const [imgError, setImgError] = useState(false);
  const fallbackImg = `https://picsum.photos/seed/${product.id}/300/300`;

  return (
    <a href={`/product/${product.id}`} className="border border-[#e8e8e8] rounded-2xl overflow-hidden hover:border-[#e31e24] hover:shadow-md transition-all cursor-pointer group flex flex-col bg-white no-underline">
      <div className="relative bg-[#f8f8f8] flex items-center justify-center" style={{ height: 180 }}>
        <img
          src={imgError || !product.image ? fallbackImg : product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        {discount && (
          <span className="absolute bottom-2 left-2 bg-[#e31e24] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {!isInStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-lg border border-gray-200">
              Нет в наличии
            </span>
          </div>
        )}
        {isInStock && filteredStock && filteredStock.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-0.5 items-end">
            {filteredStock.filter(s => s.quantity > 0).map(s => (
              <span key={s.store_id} className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium leading-tight">
                {s.store_name.replace("Торговый склад ", "").replace("Сервисный склад", "Сервис")}: {s.quantity} {product.unit || "шт"}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-1">
        {product.sku && (
          <span className="text-[10px] text-gray-400">Арт. {product.sku}</span>
        )}
        <p className="text-sm text-gray-800 leading-snug line-clamp-3 flex-1">
          {product.name}
        </p>
        {product.category_name && (
          <span className="text-[10px] text-gray-400">{product.category_name}</span>
        )}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-gray-900">
            {product.price > 0 ? product.price.toLocaleString("ru") + " ₽" : "Цена по запросу"}
          </span>
          {product.old_price && product.old_price > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {product.old_price.toLocaleString("ru")} ₽
            </span>
          )}
        </div>
        {isInStock ? (
          <button
            className={`mt-2 w-full text-sm font-medium py-2 rounded-xl transition-colors ${
              inCart
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-[#e31e24] hover:bg-[#c41920] text-white"
            }`}
            onClick={handleAddToCart}
            disabled={adding}
          >
            {adding ? "Добавляю..." : inCart ? "В корзине ✓" : (filteredStock || []).filter(s => s.quantity > 0).length > 1 ? "Выбрать склад →" : "В корзину"}
          </button>
        ) : (
          <button
            className="mt-2 w-full text-sm font-medium py-2 rounded-xl transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
            onClick={e => { e.preventDefault(); setOrderModal(true); }}
          >
            Заказать
          </button>
        )}
      </div>
      {orderModal && <OrderModal product={product} onClose={() => setOrderModal(false)} />}
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-[#e8e8e8] rounded-2xl overflow-hidden flex flex-col bg-white animate-pulse">
      <div className="bg-gray-100" style={{ height: 180 }} />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-1/2 mt-1" />
        <div className="h-9 bg-gray-100 rounded-xl mt-1" />
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const visibleStoreIds = useLocationStores();

  const [products, setProducts] = useState<Product[]>([]);
  const [allInStockProducts, setAllInStockProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inStockLoading, setInStockLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState("");

  const page = parseInt(searchParams.get("page") || "1");
  const categoryId = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const storeId = searchParams.get("store") || "";
  const inStockOnly = searchParams.get("in_stock") === "1";
  const [searchInput, setSearchInput] = useState(search);

  // Страница внутри отфильтрованного списка "в наличии"
  const [inStockPage, setInStockPage] = useState(1);

  const isInStockForLocation = useCallback((product: Product) => {
    const filtered = visibleStoreIds && visibleStoreIds.length > 0
      ? product.stock_by_store?.filter(s => visibleStoreIds.includes(s.store_id))
      : product.stock_by_store;
    return filtered?.some(s => s.quantity > 0) ?? false;
  }, [visibleStoreIds]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const loadCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=categories`);
      const data = await res.json();
      setCategories(data.items || []);
    } catch {
      setCategories([]);
    } finally {
      setCatLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${API_URL}?action=products&page=${page}&per_page=${PER_PAGE}`;
      if (categoryId) url += `&category_id=${categoryId}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (storeId) url += `&store_id=${storeId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setError(data.error + (data.detail ? `: ${data.detail}` : ""));
        setProducts([]);
        setTotal(0);
      } else {
        const items: Product[] = data.items || [];
        items.sort((a, b) => {
          const aInStock = isInStockForLocation(a) ? 1 : 0;
          const bInStock = isInStockForLocation(b) ? 1 : 0;
          return bInStock - aInStock;
        });
        setProducts(items);
        setTotal(data.total || 0);
        if (data.stores?.length) setStores(data.stores);
      }
    } catch (e: unknown) {
      setError(String(e));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, categoryId, search, storeId, isInStockForLocation]);

  // Загружает ВСЕ товары постранично и фильтрует только "в наличии"
  const loadAllInStock = useCallback(async () => {
    setInStockLoading(true);
    setError("");
    try {
      const firstUrl = `${API_URL}?action=products&page=1&per_page=100` +
        (categoryId ? `&category_id=${categoryId}` : "") +
        (search ? `&search=${encodeURIComponent(search)}` : "") +
        (storeId ? `&store_id=${storeId}` : "");
      const firstRes = await fetch(firstUrl);
      const firstData = await firstRes.json();
      if (firstData.error) { setError(firstData.error); setInStockLoading(false); return; }

      const serverTotal: number = firstData.total || 0;
      const totalApiPages = Math.ceil(serverTotal / 100);
      let all: Product[] = [...(firstData.items || [])];

      // Грузим остальные страницы параллельно
      if (totalApiPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalApiPages - 1 }, (_, i) => {
            const u = `${API_URL}?action=products&page=${i + 2}&per_page=100` +
              (categoryId ? `&category_id=${categoryId}` : "") +
              (search ? `&search=${encodeURIComponent(search)}` : "") +
              (storeId ? `&store_id=${storeId}` : "");
            return fetch(u).then(r => r.json());
          })
        );
        rest.forEach(d => { if (d.items) all = all.concat(d.items); });
      }

      const filtered = all.filter(p => isInStockForLocation(p));
      setAllInStockProducts(filtered);
      if (firstData.stores?.length) setStores(firstData.stores);
    } catch (e: unknown) {
      setError(String(e));
      setAllInStockProducts([]);
    } finally {
      setInStockLoading(false);
    }
  }, [categoryId, search, storeId, isInStockForLocation]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  useEffect(() => {
    if (inStockOnly) {
      setAllInStockProducts(null);
      setInStockPage(1);
      loadAllInStock();
    } else {
      loadProducts();
    }
  }, [inStockOnly, loadProducts, loadAllInStock]);

  // При смене локации — перезагружаем
  useEffect(() => {
    if (inStockOnly) {
      setAllInStockProducts(null);
      setInStockPage(1);
      loadAllInStock();
    }
  }, [visibleStoreIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const toggleInStock = () => {
    const next = new URLSearchParams(searchParams);
    if (inStockOnly) {
      next.delete("in_stock");
    } else {
      next.set("in_stock", "1");
    }
    next.delete("page");
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("search", searchInput.trim());
  };

  const goPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goInStockPage = (p: number) => {
    setInStockPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Данные для отображения
  const isLoading = inStockOnly ? inStockLoading : loading;
  const displayProducts = inStockOnly && allInStockProducts !== null
    ? allInStockProducts.slice((inStockPage - 1) * PER_PAGE, inStockPage * PER_PAGE)
    : products;
  const displayTotal = inStockOnly && allInStockProducts !== null ? allInStockProducts.length : total;
  const displayTotalPages = inStockOnly && allInStockProducts !== null
    ? Math.ceil(allInStockProducts.length / PER_PAGE)
    : totalPages;
  const displayPage = inStockOnly ? inStockPage : page;

  const selectedCategory = categories.find((c) => String(c.id) === categoryId);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-4 border-red-100 border-t-[#e31e24] animate-spin" />
        </div>
      )}
      <ServiceclickHeader />
      <ServiceclickNav />

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-[#e31e24]">Главная</a>
          <Icon name="ChevronRight" size={14} />
          <span className="text-gray-800 font-medium">Каталог</span>
          {selectedCategory && (
            <>
              <Icon name="ChevronRight" size={14} />
              <span className="text-gray-800 font-medium">{selectedCategory.name}</span>
            </>
          )}
        </div>

        {/* Title + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">
            {selectedCategory ? selectedCategory.name : "Каталог товаров"}
            {displayTotal > 0 && !isLoading && (
              <span className="ml-2 text-base text-gray-400 font-normal">
                {displayTotal.toLocaleString("ru")} товаров
              </span>
            )}
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Поиск по каталогу..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#e8e8e8] rounded-xl bg-white focus:outline-none focus:border-[#e31e24]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors"
            >
              Найти
            </button>
          </form>
        </div>



        {/* In-stock toggle */}
        <div className="flex items-center gap-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer select-none group" onClick={toggleInStock}>
            <span className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
              inStockOnly ? "bg-green-600 border-green-600" : "bg-white border-gray-300 group-hover:border-green-500"
            }`}>
              {inStockOnly && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className={`text-sm font-medium transition-colors ${inStockOnly ? "text-green-700" : "text-gray-600 group-hover:text-green-600"}`}>
              В наличии
            </span>
            {inStockOnly && allInStockProducts !== null && (
              <span className="text-xs text-green-600 font-medium">{allInStockProducts.length}</span>
            )}
            {inStockLoading && <span className="w-3.5 h-3.5 rounded-full border-2 border-green-200 border-t-green-600 animate-spin inline-block" />}
          </label>
        </div>

        {/* Active search badge */}
        {search && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">
              Результаты поиска: <strong>«{search}»</strong>
            </span>
            <button
              onClick={() => { setSearchInput(""); setFilter("search", ""); }}
              className="text-xs text-[#e31e24] hover:underline flex items-center gap-1"
            >
              <Icon name="X" size={12} /> Сбросить
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-sm text-red-700">
            <strong>Ошибка загрузки данных:</strong> {error}
            <p className="mt-1 text-xs text-red-500">
              Убедитесь, что API токен ProMaster добавлен в настройках проекта.
            </p>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {displayProducts.map((p) => (
              <ProductCard key={p.id} product={p} visibleStoreIds={visibleStoreIds} />
            ))}
          </div>
        ) : !error ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Icon name="PackageSearch" size={48} className="mb-3" />
            <p className="font-medium text-gray-600">
              {inStockOnly ? "Нет товаров в наличии по вашей локации" : "Товары не найдены"}
            </p>
            <p className="text-sm mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        ) : null}

        {/* Pagination */}
        {!isLoading && displayTotalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8">
            <button
              onClick={() => inStockOnly ? goInStockPage(displayPage - 1) : goPage(displayPage - 1)}
              disabled={displayPage <= 1}
              className="w-9 h-9 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>

            {Array.from({ length: Math.min(displayTotalPages, 7) }, (_, i) => {
              let p: number;
              if (displayTotalPages <= 7) {
                p = i + 1;
              } else if (displayPage <= 4) {
                p = i + 1;
              } else if (displayPage >= displayTotalPages - 3) {
                p = displayTotalPages - 6 + i;
              } else {
                p = displayPage - 3 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => inStockOnly ? goInStockPage(p) : goPage(p)}
                  className={`w-9 h-9 rounded-xl border text-sm font-medium transition-colors ${
                    p === displayPage
                      ? "bg-[#e31e24] text-white border-[#e31e24]"
                      : "bg-white border-[#e8e8e8] text-gray-700 hover:border-[#e31e24] hover:text-[#e31e24]"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => inStockOnly ? goInStockPage(displayPage + 1) : goPage(displayPage + 1)}
              disabled={displayPage >= displayTotalPages}
              className="w-9 h-9 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        )}
      </main>

      <ServiceclickFooter />
    </div>
  );
}