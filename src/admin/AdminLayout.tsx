import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuth";
import Icon from "@/components/ui/icon";

const NAV = [
  { path: "/admin", label: "Дашборд", icon: "LayoutDashboard", exact: true },
  { path: "/admin/orders", label: "Заказы", icon: "ShoppingCart" },
  { path: "/admin/catalog", label: "Каталог", icon: "Package" },
  { path: "/admin/banners", label: "Баннеры", icon: "Image" },
  { path: "/admin/locations", label: "Локации", icon: "MapPin" },
  { path: "/admin/warehouses", label: "Склады", icon: "Warehouse" },
  { path: "/admin/users", label: "Пользователи", icon: "Users" },
  { path: "/admin/settings", label: "Настройки", icon: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#e31e24] animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static z-30 top-0 left-0 h-full w-60 bg-[#1a1a2e] flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e31e24] rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Admin Panel</p>
              <p className="text-white/40 text-[10px] mt-0.5">ServiceClick</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive(item.path, item.exact)
                  ? "bg-[#e31e24] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon name={item.icon as never} size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Icon name="User" size={14} className="text-white/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <p className="text-white/40 text-[10px] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors"
          >
            <Icon name="LogOut" size={13} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-10">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Icon name="Menu" size={20} className="text-gray-600" />
          </button>
          <div className="flex-1" />
          <a href="/" target="_blank" className="text-xs text-gray-500 hover:text-[#e31e24] flex items-center gap-1 transition-colors">
            <Icon name="ExternalLink" size={13} />
            Открыть сайт
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}