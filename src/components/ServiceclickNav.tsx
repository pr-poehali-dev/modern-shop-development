import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const CATALOG_API_URL = "https://functions.poehali.dev/15c8aecd-d37b-4aed-abce-dc0748135610";

interface Category {
  id: string | number;
  name: string;
  parent_id: string | number | null;
  count: number;
}

const navLinks: { label: string; color?: string }[] = [
  { label: "Акции", color: "#ff4c06" },
  { label: "Новинки", color: "#4db8ff" },
  { label: "Доставка" },
  { label: "Оплата" },
  { label: "О компании" },
  { label: "Контакты" },
];

const F = "'Nunito Sans', Tahoma, sans-serif";

export default function ServiceclickNav() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [search, setSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && categories.length === 0 && !loading) {
      setLoading(true);
      fetch(`${CATALOG_API_URL}?action=categories`)
        .then((r) => r.json())
        .then((d) => setCategories(d.items || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 100);
    } else {
      setSearch("");
      setExpandedIds(new Set());
    }
  }, [open, categories.length, loading]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const childrenOf = (parentId: string | number) =>
    categories.filter((c) => String(c.parent_id) === String(parentId));

  const toggleExpand = (id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCategoryClick = (cat: Category) => {
    setOpen(false);
    navigate(`/catalog?category=${cat.id}`);
  };

  const q = search.trim().toLowerCase();
  const isSearching = q.length > 0;

  const filteredAll = isSearching
    ? categories.filter((c) => c.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name, "ru"))
    : [];

  const rootCats = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  return (
    <>
      {/* ── NAV BAR ── */}
      <nav style={{ background: "#2a2a2a", borderBottom: "1px solid #1e1e1e", position: "relative", zIndex: 50, fontFamily: F }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 15px", display: "flex", alignItems: "stretch", height: 44 }}>

          {/* Кнопка Каталог */}
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 18px",
              background: open
                ? "linear-gradient(0deg, #c43700 0%, #ff4c06 100%)"
                : "linear-gradient(0deg, #c43700 0%, #ff4c06 100%)",
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
              fontFamily: F,
              letterSpacing: "0.2px",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "linear-gradient(0deg, #d64a13 0%, #ff4c06 100%)")}
            onMouseOut={e => (e.currentTarget.style.background = "linear-gradient(0deg, #c43700 0%, #ff4c06 100%)")}
          >
            <Icon name={open ? "X" : "LayoutGrid"} size={15} />
            Каталог товаров
            <Icon name={open ? "ChevronUp" : "ChevronDown"} size={13} />
          </button>

          {/* Разделитель */}
          <div style={{ width: 1, background: "#3a3a3a", margin: "8px 6px", flexShrink: 0 }} />

          {/* Ссылки */}
          <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
            {navLinks.map(({ label, color }) => (
              <a
                key={label}
                href="#"
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  padding: "0 14px",
                  color: color ?? "#aaa",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: color ? 700 : 400,
                  whiteSpace: "nowrap",
                  transition: "color .15s",
                  fontFamily: F,
                }}
                onMouseOver={e => (e.currentTarget.style.color = "#fff")}
                onMouseOut={e => (e.currentTarget.style.color = color ?? "#aaa")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.45)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── SLIDE PANEL ── */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: 300,
          zIndex: 200,
          background: "#2d2d2d",
          boxShadow: "4px 0 24px rgba(0,0,0,.7)",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .28s ease-in-out",
          fontFamily: F,
        }}
      >
        {/* Panel header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", height: 48, background: "linear-gradient(0deg, #c43700 0%, #ff4c06 100%)", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="LayoutGrid" size={16} /> Каталог товаров
          </span>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.8)", cursor: "pointer", padding: 4 }}
            onMouseOver={e => (e.currentTarget.style.color = "#fff")}
            onMouseOut={e => (e.currentTarget.style.color = "rgba(255,255,255,.8)")}
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "8px 10px", borderBottom: "1px solid #3a3a3a", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <Icon name="Search" size={14} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#666", pointerEvents: "none" }} />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск категории..."
              style={{ width: "100%", boxSizing: "border-box", background: "#3a3a3a", color: "#ddd", fontSize: 13, padding: "7px 28px 7px 30px", border: "1px solid #444", borderRadius: 4, outline: "none", fontFamily: F }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666", cursor: "pointer", padding: 0 }}>
                <Icon name="X" size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Все товары */}
        {!isSearching && (
          <button
            onClick={() => { setOpen(false); navigate("/catalog"); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", background: "none", border: "none", borderBottom: "1px solid #3a3a3a", color: "#ff4c06", fontSize: 14, fontWeight: 700, cursor: "pointer", textAlign: "left", flexShrink: 0, fontFamily: F }}
            onMouseOver={e => (e.currentTarget.style.background = "#333")}
            onMouseOut={e => (e.currentTarget.style.background = "none")}
          >
            <Icon name="List" size={15} /> Все товары
          </button>
        )}

        {/* Categories list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && (
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ height: 32, background: "#3a3a3a", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          )}

          {!loading && categories.length === 0 && (
            <p style={{ color: "#666", fontSize: 13, padding: "16px" }}>Категории не найдены</p>
          )}

          {/* Search results */}
          {!loading && isSearching && (
            <>
              {filteredAll.length === 0 && (
                <p style={{ color: "#666", fontSize: 13, padding: "16px" }}>Ничего не найдено</p>
              )}
              {filteredAll.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", background: "none", border: "none", borderBottom: "1px solid #383838", color: "#ccc", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: F }}
                  onMouseOver={e => { e.currentTarget.style.background = "#3a3a3a"; e.currentTarget.style.color = "#ff4c06"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#ccc"; }}
                >
                  {cat.parent_id && <Icon name="CornerDownRight" size={12} style={{ color: "#555", flexShrink: 0 }} />}
                  <span>{cat.name}</span>
                </button>
              ))}
            </>
          )}

          {/* Hierarchical list */}
          {!loading && !isSearching && rootCats.map((cat) => {
            const children = childrenOf(cat.id).sort((a, b) => a.name.localeCompare(b.name, "ru"));
            const hasChildren = children.length > 0;
            const isExpanded = expandedIds.has(cat.id);

            return (
              <div key={cat.id}>
                <button
                  onClick={() => hasChildren ? toggleExpand(cat.id) : handleCategoryClick(cat)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 16px", background: "none", border: "none", borderBottom: "1px solid #383838", color: "#ccc", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: F }}
                  onMouseOver={e => { e.currentTarget.style.background = "#3a3a3a"; e.currentTarget.style.color = "#ff4c06"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#ccc"; }}
                >
                  <span style={{ wordBreak: "break-word" }}>{cat.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    {!hasChildren && cat.count > 0 && <span style={{ fontSize: 10, color: "#555" }}>{cat.count}</span>}
                    {hasChildren && <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={13} style={{ color: "#555" }} />}
                  </span>
                </button>

                {hasChildren && isExpanded && (
                  <div style={{ background: "#252525" }}>
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 16px 9px 28px", background: "none", border: "none", borderBottom: "1px solid #333", color: "#ff4c06", fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: F }}
                      onMouseOver={e => (e.currentTarget.style.background = "#333")}
                      onMouseOut={e => (e.currentTarget.style.background = "none")}
                    >
                      <Icon name="Layers" size={12} /> Все в «{cat.name}»
                    </button>
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleCategoryClick(child)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 16px 9px 28px", background: "none", border: "none", borderBottom: "1px solid #333", color: "#bbb", fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: F }}
                        onMouseOver={e => { e.currentTarget.style.background = "#333"; e.currentTarget.style.color = "#ff4c06"; }}
                        onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#bbb"; }}
                      >
                        <span style={{ wordBreak: "break-word" }}>{child.name}</span>
                        {child.count > 0 && <span style={{ fontSize: 10, color: "#555", marginLeft: 6, flexShrink: 0 }}>{child.count}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
