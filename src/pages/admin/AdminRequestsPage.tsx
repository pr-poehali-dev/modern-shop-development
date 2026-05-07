import { useEffect, useState, useCallback } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

const STATUSES: Record<string, { label: string; color: string }> = {
  new: { label: "Новый", color: "bg-blue-100 text-blue-700" },
  processing: { label: "В работе", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Выполнен", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Отменён", color: "bg-red-100 text-red-700" },
};

interface ProductRequest {
  id: number;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_price: number;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  comment: string;
  status: string;
  created_at: string;
}

export default function AdminRequestsPage() {
  const { token } = useAdminAuth();
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${ADMIN_API_URL}?action=requests&page=${page}&per_page=${perPage}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await fetch(url, { headers: { "X-Admin-Token": token! } });
      const data = await res.json();
      setRequests(data.items || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(ADMIN_API_URL + "?action=requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  const totalPages = Math.ceil(total / perPage);

  const formatDate = (s: string) =>
    new Date(s).toLocaleString("ru", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Запросы на товары</h1>
        <span className="text-sm text-gray-500">{total} заявок</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[["", "Все"], ["new", "Новые"], ["processing", "В работе"], ["completed", "Выполнены"], ["cancelled", "Отменены"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setStatusFilter(val); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              statusFilter === val
                ? "bg-[#e31e24] text-white border-[#e31e24]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#e31e24] hover:text-[#e31e24]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Заявок нет</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium uppercase tracking-wide">
                  <th className="text-left px-5 py-3">#</th>
                  <th className="text-left px-5 py-3">Дата</th>
                  <th className="text-left px-5 py-3">Клиент</th>
                  <th className="text-left px-5 py-3">Товар</th>
                  <th className="text-left px-5 py-3">Кол-во</th>
                  <th className="text-left px-5 py-3">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">{r.id}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{r.customer_name}</p>
                      <a href={`tel:${r.customer_phone}`} className="text-xs text-[#e31e24] hover:underline">{r.customer_phone}</a>
                    </td>
                    <td className="px-5 py-3 max-w-[220px]">
                      <p className="text-gray-800 line-clamp-2 text-xs">{r.product_name}</p>
                      {r.product_sku && <p className="text-gray-400 text-[11px] mt-0.5">Арт. {r.product_sku}</p>}
                      {r.product_price > 0 && (
                        <p className="text-gray-600 text-[11px] mt-0.5">{r.product_price.toLocaleString("ru")} ₽</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{r.quantity} шт.</td>
                    <td className="px-5 py-3">
                      <select
                        value={r.status}
                        onChange={e => updateStatus(r.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e31e24] ${STATUSES[r.status]?.color || "bg-gray-100 text-gray-600"}`}
                      >
                        {Object.entries(STATUSES).map(([val, { label }]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] disabled:opacity-30 transition-colors">
            <Icon name="ChevronLeft" size={15} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg border text-xs font-medium transition-colors ${p === page ? "bg-[#e31e24] text-white border-[#e31e24]" : "bg-white border-gray-200 text-gray-600 hover:border-[#e31e24]"}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#e31e24] hover:text-[#e31e24] disabled:opacity-30 transition-colors">
            <Icon name="ChevronRight" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
