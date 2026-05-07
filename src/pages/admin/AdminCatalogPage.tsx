import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

const PROMASTER_API = "https://functions.poehali.dev/c7265605-961b-48cb-9594-4caad2cb333e";

interface Product {
  id: string | number;
  name: string;
  price: number;
  old_price: number | null;
  sku: string;
  unit: string;
  category_name: string;
  in_stock: boolean;
  image: string;
  stock_by_store: Array<{ store_name: string; quantity: number }>;
}

interface Category {
  id: string | number;
  name: string;
}

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    let url = `${PROMASTER_API}?action=products&page=${page}&per_page=20`;
    if (categoryId) url += `&category_id=${categoryId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    const data = await res.json();
    setProducts(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, categoryId, search]);

  useEffect(() => {
    fetch(`${PROMASTER_API}?action=categories`)
      .then(r => r.json())
      .then(d => setCategories(d.items || []));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Каталог товаров</h1>
        <span className="text-sm text-gray-400">{total.toLocaleString("ru")} товаров · через ProMaster API</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2">
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Поиск..."
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#e31e24] w-52"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#e31e24] text-white text-sm rounded-xl hover:bg-[#c41920] transition-colors">Найти</button>
          {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#e31e24]"><Icon name="X" size={14} /></button>}
        </form>
        <select
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setPage(1); }}
          className="py-2 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#e31e24]"
        >
          <option value="">Все категории</option>
          {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Товары не найдены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium w-12"></th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Название</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Арт.</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Категория</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Цена</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Остатки</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Наличие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">
                      {p.image ? (
                        <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-100" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Icon name="Package" size={16} className="text-gray-400" /></div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-800 line-clamp-2 max-w-xs">{p.name}</p>
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{p.sku}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{p.category_name}</td>
                    <td className="px-4 py-2">
                      <p className="font-semibold text-gray-900">{p.price > 0 ? p.price.toLocaleString("ru") + " ₽" : "—"}</p>
                      {p.old_price && p.old_price > p.price && (
                        <p className="text-xs text-gray-400 line-through">{p.old_price.toLocaleString("ru")} ₽</p>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-0.5">
                        {p.stock_by_store?.filter(s => s.quantity > 0).map((s, i) => (
                          <span key={i} className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {s.store_name.replace("Торговый склад ", "")}: {s.quantity} {p.unit || "шт"}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.in_stock ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.in_stock ? "Есть" : "Нет"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-30"><Icon name="ChevronLeft" size={14} /></button>
            <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {Math.ceil(total / 20)}</span>
            <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-30"><Icon name="ChevronRight" size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
