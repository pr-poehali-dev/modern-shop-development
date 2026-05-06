import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import CitilinkHeader from "@/components/CitilinkHeader";
import CitilinkNav from "@/components/CitilinkNav";
import CitilinkFooter from "@/components/CitilinkFooter";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/c7265605-961b-48cb-9594-4caad2cb333e";
const PER_PAGE = 24;

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

  return (
    <div className="border border-[#e8e8e8] rounded-2xl overflow-hidden hover:border-[#e31e24] hover:shadow-md transition-all cursor-pointer group flex flex-col bg-white">
      <div className="relative bg-[#f8f8f8] flex items-center justify-center" style={{ height: 180 }}>
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-3"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300 gap-2">
            <Icon name="Package" size={40} />
            <span className="text-xs">Нет фото</span>
          </div>
        )}
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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState("");

  const page = parseInt(searchParams.get("page") || "1");
  const categoryId = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);

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
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setError(data.error + (data.detail ? `: ${data.detail}` : ""));
        setProducts([]);
        setTotal(0);
      } else {
        setProducts(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (e: unknown) {
      setError(String(e));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, categoryId, search]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
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

  const selectedCategory = categories.find((c) => String(c.id) === categoryId);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <CitilinkHeader />
      <CitilinkNav />

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

        <div className="flex gap-5">

          {/* Sidebar — categories */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4">
              <h3 className="font-bold text-sm text-gray-800 mb-3">Категории</h3>
              {catLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <ul className="space-y-0.5">
                  <li>
                    <button
                      onClick={() => setFilter("category", "")}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                        !categoryId
                          ? "bg-[#e31e24] text-white font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Все товары
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setFilter("category", String(cat.id))}
                        className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                          String(cat.id) === categoryId
                            ? "bg-[#e31e24] text-white font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {cat.count > 0 && (
                          <span className={`text-[10px] ml-1 flex-shrink-0 ${String(cat.id) === categoryId ? "text-white/70" : "text-gray-400"}`}>
                            {cat.count}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">Категории не найдены</p>
              )}
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">

            {/* Mobile categories */}
            {categories.length > 0 && (
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                <button
                  onClick={() => setFilter("category", "")}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    !categoryId ? "bg-[#e31e24] text-white border-[#e31e24]" : "border-[#e8e8e8] bg-white text-gray-700"
                  }`}
                >
                  Все
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter("category", String(cat.id))}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      String(cat.id) === categoryId
                        ? "bg-[#e31e24] text-white border-[#e31e24]"
                        : "border-[#e8e8e8] bg-white text-gray-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

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

      <CitilinkFooter />
    </div>
  );
}
