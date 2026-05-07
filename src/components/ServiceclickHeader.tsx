import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useShopLocations, type ShopLocation } from "@/hooks/useVisibleStores";

export default function ServiceclickHeader() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const shopLocations = useShopLocations();

  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(() => {
    const saved = localStorage.getItem("shop_location_id");
    return saved ? Number(saved) : null;
  });
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Закрываем дропдаун при клике вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLocation: ShopLocation | null =
    shopLocations?.find(l => l.id === selectedLocationId) ?? null;

  const handleSelect = (loc: ShopLocation | null) => {
    if (loc) {
      setSelectedLocationId(loc.id);
      localStorage.setItem("shop_location_id", String(loc.id));
    } else {
      setSelectedLocationId(null);
      localStorage.removeItem("shop_location_id");
    }
    setOpen(false);
    window.dispatchEvent(new Event("shop_location_changed"));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
  };

  const hasLocations = shopLocations && shopLocations.length > 0;

  return (
    <header className="bg-[#e31e24] text-white">
      {/* Top bar */}
      <div className="bg-[#c41920]">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-8 text-xs">
          <div className="flex gap-4">
            <a href="#" className="hover:underline opacity-90">Магазины</a>
            <a href="#" className="hover:underline opacity-90">Доставка и оплата</a>
            <a href="#" className="hover:underline opacity-90">Корпоративным клиентам</a>
            <a href="#" className="hover:underline opacity-90">Сервисный центр</a>
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <span className="opacity-90">
                {user.name} ·{" "}
                <button onClick={logout} className="hover:underline">Выйти</button>
              </span>
            ) : (
              <a href="/login" className="hover:underline opacity-90">Войти</a>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <a href="/" className="flex-shrink-0">
          <div className="text-white font-bold text-2xl tracking-tight">
            <span className="text-white text-3xl font-black italic">Serviceclick</span>
          </div>
        </a>

        {/* Выбор локации / fallback каталог */}
        {hasLocations ? (
          <div className="relative flex-shrink-0" ref={dropRef}>
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 bg-white text-[#e31e24] font-semibold px-4 py-2 rounded text-sm hover:bg-gray-100 transition-colors min-w-[140px]"
            >
              <Icon name="MapPin" size={15} />
              <span className="truncate max-w-[110px]">
                {selectedLocation ? (selectedLocation.city || selectedLocation.name) : "Весь сайт"}
              </span>
              <Icon name="ChevronDown" size={14} className={`ml-auto transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 min-w-[180px] py-1 overflow-hidden">
                <button
                  onClick={() => handleSelect(null)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${!selectedLocationId ? "text-[#e31e24] font-semibold" : "text-gray-700"}`}
                >
                  <Icon name="Globe" size={14} className="flex-shrink-0" />
                  Весь сайт
                </button>
                <div className="h-px bg-gray-100 mx-3 my-1" />
                {shopLocations!.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelect(loc)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${selectedLocationId === loc.id ? "text-[#e31e24] font-semibold bg-red-50" : "text-gray-700"}`}
                  >
                    <Icon name="MapPin" size={14} className="flex-shrink-0" />
                    {loc.city || loc.name}
                    {selectedLocationId === loc.id && (
                      <Icon name="Check" size={13} className="ml-auto text-[#e31e24]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <a href="/catalog" className="flex items-center gap-2 bg-white text-[#e31e24] font-semibold px-4 py-2 rounded text-sm flex-shrink-0 hover:bg-gray-100 transition-colors">
            <Icon name="LayoutGrid" size={16} />
            Каталог
          </a>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск по сайту"
            className="w-full h-10 pl-4 pr-12 rounded text-gray-900 text-sm outline-none border-0"
          />
          <button type="submit" className="absolute right-0 top-0 h-10 w-10 bg-[#c41920] rounded-r flex items-center justify-center hover:bg-[#a51217] transition-colors">
            <Icon name="Search" size={18} className="text-white" />
          </button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex flex-col items-center gap-0.5 px-3 py-1 hover:bg-[#c41920] rounded transition-colors text-white">
            <Icon name="MapPin" size={20} />
            <span className="text-xs">Магазины</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-3 py-1 hover:bg-[#c41920] rounded transition-colors text-white">
            <Icon name="Heart" size={20} />
            <span className="text-xs">Избранное</span>
          </button>
          <a
            href={user ? "#" : "/login"}
            onClick={user ? (e) => { e.preventDefault(); } : undefined}
            className="flex flex-col items-center gap-0.5 px-3 py-1 hover:bg-[#c41920] rounded transition-colors text-white"
          >
            <Icon name="User" size={20} />
            <span className="text-xs">{user ? user.name.split(" ")[0] : "Войти"}</span>
          </a>
          <a
            href="/cart"
            className="flex flex-col items-center gap-0.5 px-3 py-1 hover:bg-[#c41920] rounded transition-colors text-white relative"
          >
            <div className="relative">
              <Icon name="ShoppingCart" size={20} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#e31e24] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </div>
            <span className="text-xs">Корзина</span>
          </a>
        </div>
      </div>
    </header>
  );
}