import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/58efb070-a53e-4380-88c5-6f0f16480430";

interface Category {
  id: string | number;
  name: string;
  parent_id: string | number | null;
  count: number;
}

const navLinks = [
  "Акции",
  "Рассрочка 0%",
  "Трейд-ин",
  "Кредит",
  "Подписки",
  "Новинки",
  "Лизинг",
];

export default function ServiceclickNav() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Загружаем категории при первом открытии
  useEffect(() => {
    if (open && categories.length === 0 && !loading) {
      setLoading(true);
      fetch(`${API_URL}?action=categories`)
        .then((r) => r.json())
        .then((d) => setCategories(d.items || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, categories.length, loading]);

  // Закрываем по клику вне панели
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const rootCats = categories.filter((c) => !c.parent_id);
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

  return (
    <>
      <nav className="bg-white border-b border-[#e0e0e0] relative z-50">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center gap-6 h-11">
          {/* Catalog trigger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-2 font-semibold text-sm h-11 px-1 transition-colors ${
              open ? "text-[#c41920]" : "text-[#e31e24] hover:text-[#c41920]"
            }`}
          >
            <Icon name="LayoutGrid" size={16} />
            Каталог товаров
            <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} />
          </button>

          {/* Nav links */}
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className={`text-sm h-11 flex items-center hover:text-[#e31e24] transition-colors whitespace-nowrap ${
                link === "Акции" || link === "Рассрочка 0%"
                  ? "text-[#e31e24] font-semibold"
                  : "text-gray-700"
              }`}
            >
              {link}
            </a>
          ))}
        </div>
      </nav>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Side panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 left-0 h-full z-50 bg-[#2d2d2d] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: 280 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 bg-[#e31e24] flex-shrink-0">
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <Icon name="LayoutGrid" size={16} />
            Каталог товаров
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* "All catalog" link */}
        <button
          onClick={() => { setOpen(false); navigate("/catalog"); }}
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#e31e24] hover:bg-[#3a3a3a] border-b border-[#444] transition-colors text-left"
        >
          <Icon name="List" size={15} />
          Все товары
        </button>

        {/* Categories list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col gap-1 p-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-8 bg-[#3a3a3a] rounded animate-pulse" />
              ))}
            </div>
          )}

          {!loading && categories.length === 0 && (
            <p className="text-xs text-gray-400 px-4 py-4">Категории не найдены</p>
          )}

          {!loading && rootCats.map((cat) => {
            const children = childrenOf(cat.id);
            const hasChildren = children.length > 0;
            const isExpanded = expandedIds.has(cat.id);

            return (
              <div key={cat.id}>
                <div className="flex items-stretch border-b border-[#444]">
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className="flex-1 flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-[#3a3a3a] hover:text-[#e31e24] transition-colors text-left"
                  >
                    <span className="truncate">{cat.name}</span>
                    {!hasChildren && cat.count > 0 && (
                      <span className="text-[10px] text-gray-500 ml-2 flex-shrink-0">{cat.count}</span>
                    )}
                  </button>
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(cat.id)}
                      className="px-3 text-gray-400 hover:text-[#e31e24] hover:bg-[#3a3a3a] transition-colors flex-shrink-0 flex items-center"
                    >
                      <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={13} />
                    </button>
                  )}
                </div>

                {hasChildren && isExpanded && (
                  <div className="bg-[#252525]">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleCategoryClick(child)}
                        className="w-full flex items-center justify-between pl-8 pr-4 py-2 text-[13px] text-gray-300 hover:bg-[#3a3a3a] hover:text-[#e31e24] transition-colors border-b border-[#383838] text-left"
                      >
                        <span className="truncate">{child.name}</span>
                        {child.count > 0 && (
                          <span className="text-[10px] text-gray-500 ml-2 flex-shrink-0">{child.count}</span>
                        )}
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