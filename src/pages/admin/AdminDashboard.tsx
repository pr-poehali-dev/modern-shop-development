import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth, ADMIN_API_URL } from "@/admin/AdminAuth";
import Icon from "@/components/ui/icon";

const STATUSES: Record<string, { label: string; color: string }> = {
  new: { label: "Новый", color: "bg-blue-100 text-blue-700" },
  processing: { label: "В работе", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Выполнен", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Отменён", color: "bg-red-100 text-red-700" },
};

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<{ total: number; new_count: number; items: unknown[] }>({ total: 0, new_count: 0, items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${ADMIN_API_URL}?action=orders&per_page=5`, { headers: { "X-Admin-Token": token! } })
      .then((r) => r.json())
      .then((d) => {
        const items = d.items || [];
        const newCount = items.filter((o: { status: string }) => o.status === "new").length;
        setOrders({ total: d.total || 0, new_count: newCount, items });
      })
      .finally(() => setLoading(false));
  }, [token]);

  const cards = [
    { label: "Всего заказов", value: orders.total, icon: "ShoppingCart", color: "bg-blue-50 text-blue-600", link: "/admin/orders" },
    { label: "Новых заказов", value: orders.new_count, icon: "Bell", color: "bg-red-50 text-red-600", link: "/admin/orders?status=new" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Дашборд</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.link} className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#e31e24] transition-colors">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <Icon name={c.icon as never} size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </Link>
        ))}
        <Link to="/admin/catalog" className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#e31e24] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Icon name="Package" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">API</p>
          <p className="text-xs text-gray-500 mt-0.5">Каталог товаров</p>
        </Link>
        <Link to="/admin/banners" className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#e31e24] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
            <Icon name="Image" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">Баннеры</p>
          <p className="text-xs text-gray-500 mt-0.5">Управление слайдером</p>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Последние заказы</h2>
          <Link to="/admin/orders" className="text-xs text-[#e31e24] hover:underline">Все заказы</Link>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-gray-100 border-t-[#e31e24] animate-spin" />
          </div>
        ) : orders.items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Заказов пока нет</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(orders.items as Array<{ id: number; order_number: string; customer_name: string; customer_phone: string; total_price: number; status: string; created_at: string }>).map((o) => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">#{o.order_number || o.id} — {o.customer_name}</p>
                  <p className="text-xs text-gray-400">{o.customer_phone}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{Number(o.total_price).toLocaleString("ru")} ₽</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUSES[o.status]?.color || "bg-gray-100 text-gray-600"}`}>
                  {STATUSES[o.status]?.label || o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
