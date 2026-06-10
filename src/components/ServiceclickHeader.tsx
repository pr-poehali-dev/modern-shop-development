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
    <header>
      {/* Topbar */}
      <div className="bg-[#1a1a1a] border-b border-[#2e2e2e]">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-9 text-xs text-[#999]">
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Магазины</a>
            <a href="#" className="hover:text-white transition-colors">Доставка и оплата</a>
            <a href="#" className="hover:text-white transition-colors">Корпоративным клиентам</a>
            <a href="#" className="hover:text-white transition-colors">Сервисный центр</a>
          </div>
          <div className="flex gap-5 items-center">
            <a href="tel:+78001234567" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Icon name="Phone" size={12} />
              8 800 123-45-67
            </a>
            {user ? (
              <span className="flex items-center gap-2">
                <span>{user.name}</span>
                <span className="text-[#444]">·</span>
                <button onClick={logout} className="hover:text-white transition-colors">Выйти</button>
              </span>
            ) : (
              <a href="/login" className="hover:text-white transition-colors">Войти</a>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-[#222222]">
        <div className="max-w-[1200px] mx-auto px-4 py-3.5 flex items-center gap-5">
          {/* Logo */}
          <a href="/" className="flex-shrink-0 mr-1">
            <div className="font-black text-[26px] tracking-tight leading-none">
              <span className="text-white italic">Service</span><span className="text-[#e31e24] italic">click</span>
            </div>
          </a>

          {/* Выбор локации */}
          {hasLocations && (
            <div className="relative flex-shrink-0" ref={dropRef}>
              <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 border border-[#3a3a3a] bg-[#2e2e2e] text-[#ccc] hover:border-[#555] hover:text-white px-3 py-2 rounded text-xs transition-colors min-w-[130px]"
              >
                <Icon name="MapPin" size={13} className="text-[#e31e24]" />
                <span className="truncate max-w-[90px]">
                  {selectedLocation ? (selectedLocation.city || selectedLocation.name) : "Весь сайт"}
                </span>
                <Icon name="ChevronDown" size={12} className={`ml-auto flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="absolute top-full left-0 mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-2xl z-50 min-w-[180px] py-1 overflow-hidden">
                  <button
                    onClick={() => handleSelect(null)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#333] ${!selectedLocationId ? "text-[#e31e24] font-semibold" : "text-[#ccc]"}`}
                  >
                    <Icon name="Globe" size={13} className="flex-shrink-0" />
                    Весь сайт
                  </button>
                  <div className="h-px bg-[#333] mx-3 my-1" />
                  {shopLocations!.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#333] ${selectedLocationId === loc.id ? "text-[#e31e24] font-semibold" : "text-[#ccc]"}`}
                    >
                      <Icon name="MapPin" size={13} className="flex-shrink-0" />
                      {loc.city || loc.name}
                      {selectedLocationId === loc.id && (
                        <Icon name="Check" size={12} className="ml-auto text-[#e31e24]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex h-10 rounded overflow-hidden border border-[#3a3a3a] focus-within:border-[#e31e24] transition-colors">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Поиск товаров..."
                className="flex-1 bg-[#2e2e2e] text-white text-sm px-4 outline-none placeholder:text-[#666]"
              />
              <button
                type="submit"
                className="bg-[#e31e24] hover:bg-[#c41920] w-11 flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <Icon name="Search" size={17} className="text-white" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href="/catalog"
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded hover:bg-[#2e2e2e] transition-colors text-[#aaa] hover:text-white"
            >
              <Icon name="LayoutGrid" size={20} />
              <span className="text-[11px]">Каталог</span>
            </a>
            <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded hover:bg-[#2e2e2e] transition-colors text-[#aaa] hover:text-white">
              <Icon name="Heart" size={20} />
              <span className="text-[11px]">Избранное</span>
            </button>
            <a
              href={user ? "#" : "/login"}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded hover:bg-[#2e2e2e] transition-colors text-[#aaa] hover:text-white"
            >
              <Icon name="User" size={20} />
              <span className="text-[11px]">{user ? user.name.split(" ")[0] : "Войти"}</span>
            </a>
            <a
              href="/cart"
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded hover:bg-[#2e2e2e] transition-colors text-[#aaa] hover:text-white relative"
            >
              <div className="relative">
                <Icon name="ShoppingCart" size={20} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#e31e24] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </div>
              <span className="text-[11px]">Корзина</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
