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
  const [locOpen, setLocOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const locRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setLocOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
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
    setLocOpen(false);
    window.dispatchEvent(new Event("shop_location_changed"));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
  };

  const hasLocations = shopLocations && shopLocations.length > 0;

  return (
    <div id="header" style={{ fontFamily: "'Nunito Sans', Tahoma, sans-serif", background: "#222222", color: "#fff" }}>

      {/* ── TOPBAR ── */}
      <div style={{ background: "#222222", borderBottom: "1px solid #363636" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 15px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 36 }}>

          {/* Left: город + телефон */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {hasLocations && (
              <div ref={locRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setLocOpen(v => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                >
                  <Icon name="MapPin" size={13} />
                  <span style={{ color: "#ccc" }}>
                    {selectedLocation ? (selectedLocation.city || selectedLocation.name) : "Выбрать город"}
                  </span>
                  <Icon name="ChevronDown" size={11} />
                </button>
                {locOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: "#2a2a2a", border: "1px solid #444", borderRadius: 4, minWidth: 190, zIndex: 200, boxShadow: "0 4px 20px rgba(0,0,0,.6)" }}>
                    <button onClick={() => handleSelect(null)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 14px", background: "none", border: "none", color: !selectedLocationId ? "#ff4c06" : "#ccc", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                      <Icon name="Globe" size={13} /> Весь сайт
                    </button>
                    <div style={{ height: 1, background: "#3a3a3a", margin: "2px 10px" }} />
                    {shopLocations!.map(loc => (
                      <button key={loc.id} onClick={() => handleSelect(loc)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 14px", background: selectedLocationId === loc.id ? "#333" : "none", border: "none", color: selectedLocationId === loc.id ? "#ff4c06" : "#ccc", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                        <Icon name="MapPin" size={13} /> {loc.city || loc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <a href="tel:+78001234567" style={{ display: "flex", alignItems: "center", gap: 5, color: "#ccc", textDecoration: "none", fontSize: 13 }}>
              <Icon name="Phone" size={13} />
              8 800 123-45-67
              <span style={{ color: "#555", fontSize: 11, marginLeft: 2 }}>бесплатно</span>
            </a>
          </div>

          {/* Right: ссылки */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {["О компании", "Доставка и оплата", "Контакты"].map(link => (
              <a key={link} href="#" style={{ color: "#999", textDecoration: "none", fontSize: 13 }}
                onMouseOver={e => (e.currentTarget.style.color = "#fff")}
                onMouseOut={e => (e.currentTarget.style.color = "#999")}
              >{link}</a>
            ))}
            {user ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#999", fontSize: 13 }}>
                {user.name}
                <span style={{ color: "#444" }}>·</span>
                <button onClick={logout} style={{ background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                  onMouseOver={e => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={e => (e.currentTarget.style.color = "#999")}
                >Выйти</button>
              </span>
            ) : (
              <a href="/login" style={{ color: "#999", textDecoration: "none", fontSize: 13 }}
                onMouseOver={e => (e.currentTarget.style.color = "#fff")}
                onMouseOut={e => (e.currentTarget.style.color = "#999")}
              >Войти</a>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <div style={{ background: "#222222" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 15px", display: "flex", alignItems: "center", gap: 22 }}>

          {/* Logo */}
          <a href="/" style={{ flexShrink: 0, textDecoration: "none", marginRight: 4 }}>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontFamily: "'Nunito Sans', Tahoma, sans-serif", fontWeight: 800, fontStyle: "italic", fontSize: 30, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>
                Service<span style={{ color: "#ff4c06" }}>click</span>
              </div>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.8px", marginTop: 3, textTransform: "uppercase", fontStyle: "normal", fontWeight: 400 }}>
                мобильные аксессуары
              </div>
            </div>
          </a>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", height: 42 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Поиск по каталогу..."
              style={{
                flex: 1,
                height: "100%",
                padding: "0 16px",
                fontSize: 15,
                border: "none",
                borderRadius: "4px 0 0 4px",
                outline: "none",
                background: "#fff",
                color: "#333",
                fontFamily: "'Nunito Sans', Tahoma, sans-serif",
              }}
            />
            <button
              type="submit"
              style={{
                width: 54,
                height: "100%",
                background: "linear-gradient(0deg, #c43700 0%, #ff4c06 100%)",
                border: "none",
                borderRadius: "0 4px 4px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="Search" size={20} style={{ color: "#fff" }} />
            </button>
          </form>

          {/* Right action icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>

            {/* Сравнение */}
            <button
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 13px", background: "none", border: "none", cursor: "pointer", color: "#aaa", borderRadius: 4, fontFamily: "inherit" }}
              onMouseOver={e => (e.currentTarget.style.color = "#fff")}
              onMouseOut={e => (e.currentTarget.style.color = "#aaa")}
            >
              <Icon name="GitCompare" size={22} />
              <span style={{ fontSize: 11 }}>Сравнение</span>
            </button>

            {/* Избранное */}
            <button
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 13px", background: "none", border: "none", cursor: "pointer", color: "#aaa", borderRadius: 4, fontFamily: "inherit" }}
              onMouseOver={e => (e.currentTarget.style.color = "#fff")}
              onMouseOut={e => (e.currentTarget.style.color = "#aaa")}
            >
              <Icon name="Heart" size={22} />
              <span style={{ fontSize: 11 }}>Избранное</span>
            </button>

            {/* Личный кабинет */}
            <div ref={userRef} style={{ position: "relative" }}>
              <button
                onClick={() => user ? setUserOpen(v => !v) : navigate("/login")}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 13px", background: "none", border: "none", cursor: "pointer", color: "#aaa", borderRadius: 4, fontFamily: "inherit" }}
                onMouseOver={e => (e.currentTarget.style.color = "#fff")}
                onMouseOut={e => (e.currentTarget.style.color = "#aaa")}
              >
                <Icon name="User" size={22} />
                <span style={{ fontSize: 11 }}>{user ? user.name.split(" ")[0] : "Войти"}</span>
              </button>
              {user && userOpen && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "#2a2a2a", border: "1px solid #444", borderRadius: 4, minWidth: 170, zIndex: 200, boxShadow: "0 4px 20px rgba(0,0,0,.6)" }}>
                  <a href="#" style={{ display: "block", padding: "10px 16px", color: "#ccc", textDecoration: "none", fontSize: 13, borderBottom: "1px solid #3a3a3a" }}
                    onMouseOver={e => (e.currentTarget.style.background = "#333")}
                    onMouseOut={e => (e.currentTarget.style.background = "none")}
                  >Мои заказы</a>
                  <button onClick={logout} style={{ display: "block", width: "100%", padding: "10px 16px", background: "none", border: "none", color: "#ccc", fontSize: 13, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}
                    onMouseOver={e => (e.currentTarget.style.background = "#333")}
                    onMouseOut={e => (e.currentTarget.style.background = "none")}
                  >Выйти</button>
                </div>
              )}
            </div>

            {/* Корзина */}
            <a
              href="/cart"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 13px", textDecoration: "none", color: "#aaa", borderRadius: 4, position: "relative" }}
              onMouseOver={e => (e.currentTarget.style.color = "#fff")}
              onMouseOut={e => (e.currentTarget.style.color = "#aaa")}
            >
              <div style={{ position: "relative" }}>
                <Icon name="ShoppingCart" size={22} />
                {count > 0 && (
                  <span style={{ position: "absolute", top: -6, right: -8, background: "#ff4c06", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: "50%", width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11 }}>Корзина</span>
            </a>

          </div>
        </div>
      </div>

    </div>
  );
}
