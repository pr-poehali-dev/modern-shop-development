import { useEffect, useState, useCallback } from "react";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

const STATUSES: Record<string, { label: string; color: string }> = {
  new: { label: "Новый", color: "bg-blue-100 text-blue-700" },
  processing: { label: "В работе", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Выполнен", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Отменён", color: "bg-red-100 text-red-700" },
};

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total_price: number;
  status: string;
  comment: string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let url = `${ADMIN_API_URL}?action=orders&page=${page}&per_page=20`;
    if (statusFilter) url += `&status=${statusFilter}`;
    const res = await fetch(url, { headers: { "X-Admin-Token": token! } });
    const data = await res.json();
    setOrders(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [token, page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(true);
    await fetch(`${ADMIN_API_URL}?action=orders`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token! },
      body: JSON.stringify({ id, status }),
    });
    setUpdating(false);
    if (selected?.id === id) setSelected({ ...selected, status });
    load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-5">Заказы</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[["", "Все"], ["new", "Новые"], ["processing", "В работе"], ["completed", "Выполнены"], ["cancelled", "Отменённые"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setStatusFilter(val); setPage(1); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statusFilter === val ? "bg-[#e31e24] text-white border-[#e31e24]" : "bg-white border-gray-200 text-gray-600 hover:border-[#e31e24]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Заказов нет</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">№</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Клиент</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Телефон</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Сумма</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Статус</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Дата</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">#{o.order_number || o.id}</td>
                    <td className="px-4 py-3 text-gray-700">{o.customer_name}</td>
                    <td className="px-4 py-3 text-gray-500">{o.customer_phone}</td>
                    <td className="px-4 py-3 font-semibold">{Number(o.total_price).toLocaleString("ru")} ₽</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUSES[o.status]?.color || "bg-gray-100 text-gray-600"}`}>
                        {STATUSES[o.status]?.label || o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString("ru")}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(o)} className="text-[#e31e24] hover:underline text-xs">
                        Открыть
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-30 hover:border-[#e31e24]">
              <Icon name="ChevronLeft" size={14} />
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {Math.ceil(total / 20)}</span>
            <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-30 hover:border-[#e31e24]">
              <Icon name="ChevronRight" size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Заказ #{selected.order_number || selected.id}</h2>
              <button onClick={() => setSelected(null)}><Icon name="X" size={18} className="text-gray-400" /></button>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400">Клиент</p><p className="font-medium">{selected.customer_name}</p></div>
                <div><p className="text-xs text-gray-400">Телефон</p><p className="font-medium">{selected.customer_phone}</p></div>
                {selected.customer_email && <div><p className="text-xs text-gray-400">Email</p><p>{selected.customer_email}</p></div>}
                {selected.address && <div><p className="text-xs text-gray-400">Адрес</p><p>{selected.address}</p></div>}
              </div>
              {selected.comment && (
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Комментарий</p><p>{selected.comment}</p></div>
              )}
            </div>

            {selected.items?.length > 0 && (
              <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
                <p className="text-xs text-gray-500 px-3 py-2 bg-gray-50 border-b border-gray-100">Товары</p>
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between px-3 py-2 text-sm border-b border-gray-50 last:border-0">
                    <span className="text-gray-700">{item.name} × {item.quantity}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString("ru")} ₽</span>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-2 font-bold text-sm bg-gray-50">
                  <span>Итого</span>
                  <span>{Number(selected.total_price).toLocaleString("ru")} ₽</span>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400 mb-2">Изменить статус</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUSES).map(([val, info]) => (
                  <button
                    key={val}
                    disabled={updating || selected.status === val}
                    onClick={() => updateStatus(selected.id, val)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected.status === val ? "bg-[#e31e24] text-white border-[#e31e24]" : "border-gray-200 text-gray-600 hover:border-[#e31e24]"}`}
                  >
                    {info.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
