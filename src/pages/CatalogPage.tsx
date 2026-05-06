import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickFooter from "@/components/ServiceclickFooter";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/c7265605-961b-48cb-9594-4caad2cb333e";
const PER_PAGE = 24;

const SORT_OPTIONS = [
  { value: "", label: "По умолчанию" },
  { value: "price_asc", label: "Цена: по возрастанию" },
  { value: "price_desc", label: "Цена: по убыванию" },
  { value: "name_asc", label: "Название: А → Я" },
  { value: "name_desc", label: "Название: Я → А" },
];

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

function ProductCard({ product }: { product: Product }) {
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : null;

  const [imgError, setImgError] = useState(false);
  const fallbackImg = `https://picsum.photos/seed/${product.id}/300/300`;

  return (
    <div className="border border-[#e8e8e8] rounded-2xl overflow-hidden hover:border-[#e31e24] hover:shadow-md transition-all cursor-pointer group flex flex-col bg-white">
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
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-lg border border-gray-200">
              Нет в наличии
            </span>
          </div>
        )}
        {product.in_stock && product.stock_by_store?.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-0.5 items-end">
            {product.stock_by_store.filter(s => s.quantity > 0).map(s => (
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
        <button className="mt-2 w-full bg-[#e31e24] hover:bg-[#c41920] text-white text-sm font-medium py-2 rounded-xl transition-colors">
          В корзину
        </button>
      </div>
    </div>
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

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const categoryId = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const storeId = searchParams.get("store") || "";
  const priceMin = searchParams.get("price_min") || "";
  const priceMax = searchParams.get("price_max") || "";
  const inStock = searchParams.get("in_stock") || "";
  const sort = searchParams.get("sort") || "";
  const skuSearch = searchParams.get("sku_search") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [skuInput, setSkuInput] = useState(skuSearch);
  const [priceMinInput, setPriceMinInput] = useState(priceMin);
  const [priceMaxInput, setPriceMaxInput] = useState(priceMax);
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(total / PER_PAGE);

  const activeFiltersCount = [priceMin, priceMax, inStock, storeId, skuSearch].filter(Boolean).length;

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
      if (priceMin) url += `&price_min=${priceMin}`;
      if (priceMax) url += `&price_max=${priceMax}`;
      if (inStock) url += `&in_stock=${inStock}`;
      if (sort) url += `&sort=${sort}`;
      if (skuSearch) url += `&sku_search=${encodeURIComponent(skuSearch)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setError(data.error + (data.detail ? `: ${data.detail}` : ""));
        setProducts([]);
        setTotal(0);
      } else {
        setProducts(data.items || []);
        setTotal(data.total || 0);
        if (data.stores?.length) setStores(data.stores);
        if (data.price_range && !priceRange) setPriceRange(data.price_range);
      }
    } catch (e: unknown) {
      setError(String(e));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, categoryId, search, storeId, priceMin, priceMax, inStock, sort, skuSearch]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const setMultiFilter = (pairs: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(pairs).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    next.delete("page");
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    const next = new URLSearchParams();
    if (categoryId) next.set("category", categoryId);
    setSearchParams(next);
    setSearchInput("");
    setSkuInput("");
    setPriceMinInput("");
    setPriceMaxInput("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMultiFilter({ search: searchInput.trim(), sku_search: skuInput.trim() });
  };

  const handlePriceChange = (min: string, max: string) => {
    if (priceTimer.current) clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => {
      setMultiFilter({ price_min: min, price_max: max });
    }, 600);
  };

  const goPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedCategory = categories.find((c) => String(c.id) === categoryId);

  const FilterPanel = () => (
    <div className="flex flex-col gap-5">

      {/* Категории */}
      {!catLoading && categories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Категория</p>
          <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto pr-1">
            <button
              onClick={() => setFilter("category", "")}
              className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!categoryId ? "bg-[#e31e24]/10 text-[#e31e24] font-medium" : "text-gray-700 hover:bg-gray-100"}`}
            >
              Все категории
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter("category", String(cat.id))}
                className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between ${String(cat.id) === categoryId ? "bg-[#e31e24]/10 text-[#e31e24] font-medium" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <span className="line-clamp-1">{cat.name}</span>
                <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <hr className="border-[#e8e8e8]" />

      {/* Наличие */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Наличие</p>
        <label className="flex items-center gap-2 cursor-pointer group">
          <div
            onClick={() => setFilter("in_stock", inStock === "1" ? "" : "1")}
            className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${inStock === "1" ? "bg-[#e31e24]" : "bg-gray-200"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${inStock === "1" ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-gray-700">Только в наличии</span>
        </label>
      </div>

      <hr className="border-[#e8e8e8]" />

      {/* Цена */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Цена, ₽</p>
        {priceRange && (
          <p className="text-[10px] text-gray-400 mb-2">
            Диапазон: {priceRange.min.toLocaleString("ru")} — {priceRange.max.toLocaleString("ru")} ₽
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="От"
            value={priceMinInput}
            onChange={(e) => {
              setPriceMinInput(e.target.value);
              handlePriceChange(e.target.value, priceMaxInput);
            }}
            className="w-full text-sm border border-[#e8e8e8] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#e31e24]"
          />
          <span className="text-gray-400 flex-shrink-0">—</span>
          <input
            type="number"
            placeholder="До"
            value={priceMaxInput}
            onChange={(e) => {
              setPriceMaxInput(e.target.value);
              handlePriceChange(priceMinInput, e.target.value);
            }}
            className="w-full text-sm border border-[#e8e8e8] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#e31e24]"
          />
        </div>
      </div>

      <hr className="border-[#e8e8e8]" />

      {/* Склад */}
      {stores.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Склад</p>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setFilter("store", "")}
              className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!storeId ? "bg-[#e31e24]/10 text-[#e31e24] font-medium" : "text-gray-700 hover:bg-gray-100"}`}
            >
              Все склады
            </button>
            {stores.map((s) => (
              <button
                key={s.id}
                onClick={() => setFilter("store", String(s.id))}
                className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${String(s.id) === storeId ? "bg-[#e31e24]/10 text-[#e31e24] font-medium" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeFiltersCount > 0 && (
        <button
          onClick={resetAllFilters}
          className="text-sm text-[#e31e24] hover:underline flex items-center gap-1.5 mt-1"
        >
          <Icon name="X" size={13} /> Сбросить все фильтры
        </button>
      )}
    </div>
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">
            {selectedCategory ? selectedCategory.name : "Каталог товаров"}
            {total > 0 && !loading && (
              <span className="ml-2 text-base text-gray-400 font-normal">
                {total.toLocaleString("ru")} товаров
              </span>
            )}
          </h1>

          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Поиск по названию..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#e8e8e8] rounded-xl bg-white focus:outline-none focus:border-[#e31e24] min-w-[180px]"
                />
              </div>
              <div className="relative flex-1">
                <Icon name="Hash" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  placeholder="Поиск по артикулу..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#e8e8e8] rounded-xl bg-white focus:outline-none focus:border-[#e31e24] min-w-[180px]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors flex-shrink-0"
            >
              Найти
            </button>
          </form>
        </div>

        {/* Toolbar: sort + mobile filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Icon name="ArrowUpDown" size={14} className="text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setFilter("sort", e.target.value)}
              className="text-sm border border-[#e8e8e8] rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-[#e31e24] text-gray-700"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Active filters badges */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {search && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#e31e24]/10 text-[#e31e24] px-2 py-0.5 rounded-full">
                «{search}»
                <button onClick={() => { setSearchInput(""); setFilter("search", ""); }}><Icon name="X" size={10} /></button>
              </span>
            )}
            {skuSearch && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#e31e24]/10 text-[#e31e24] px-2 py-0.5 rounded-full">
                Арт: {skuSearch}
                <button onClick={() => { setSkuInput(""); setFilter("sku_search", ""); }}><Icon name="X" size={10} /></button>
              </span>
            )}
            {(priceMin || priceMax) && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#e31e24]/10 text-[#e31e24] px-2 py-0.5 rounded-full">
                {priceMin ? priceMin + " ₽" : "0"} — {priceMax ? priceMax + " ₽" : "∞"}
                <button onClick={() => { setPriceMinInput(""); setPriceMaxInput(""); setMultiFilter({ price_min: "", price_max: "" }); }}><Icon name="X" size={10} /></button>
              </span>
            )}
            {inStock && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                В наличии
                <button onClick={() => setFilter("in_stock", "")}><Icon name="X" size={10} /></button>
              </span>
            )}
          </div>

          {/* Mobile filters button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm border border-[#e8e8e8] bg-white rounded-xl px-3 py-1.5 text-gray-700 hover:border-[#e31e24] transition-colors flex-shrink-0"
          >
            <Icon name="SlidersHorizontal" size={14} />
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="ml-0.5 bg-[#e31e24] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-5">

          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <Icon name="SlidersHorizontal" size={15} /> Фильтры
                </span>
                {activeFiltersCount > 0 && (
                  <span className="text-xs bg-[#e31e24] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile filters drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white overflow-y-auto p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-800">Фильтры</span>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                    <Icon name="X" size={18} />
                  </button>
                </div>
                <FilterPanel />
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-4 w-full bg-[#e31e24] text-white rounded-xl py-2.5 text-sm font-medium"
                >
                  Показать {total.toLocaleString("ru")} товаров
                </button>
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="flex-1 min-w-0">

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
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: PER_PAGE }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : !error ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Icon name="PackageSearch" size={48} className="mb-3" />
                <p className="font-medium text-gray-600">Товары не найдены</p>
                <p className="text-sm mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="mt-3 text-sm text-[#e31e24] hover:underline"
                  >
                    Сбросить все фильтры
                  </button>
                )}
              </div>
            ) : null}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <button
                  onClick={() => goPage(page - 1)}
                  disabled={page <= 1}
                  className="w-9 h-9 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon name="ChevronLeft" size={16} />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1;
                  } else if (page >= totalPages - 3) {
                    p = totalPages - 6 + i;
                  } else {
                    p = page - 3 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => goPage(p)}
                      className={`w-9 h-9 rounded-xl border text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-[#e31e24] text-white border-[#e31e24]"
                          : "bg-white border-[#e8e8e8] text-gray-700 hover:border-[#e31e24] hover:text-[#e31e24]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => goPage(page + 1)}
                  disabled={page >= totalPages}
                  className="w-9 h-9 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon name="ChevronRight" size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <ServiceclickFooter />
    </div>
  );
}
