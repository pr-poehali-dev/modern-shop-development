import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/c7265605-961b-48cb-9594-4caad2cb333e";

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

// Группируем категории по первой букве для имитации подкатегорий
function groupCategories(cats: Category[]) {
  const groups: Record<string, Category[]> = {};
  for (const cat of cats) {
    const letter = cat.name.trim()[0]?.toUpperCase() || "#";
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(cat);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, "ru"));
}

export default function CitilinkNav() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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

  const toggleGroup = (letter: string) => {
    setExpanded((prev) => ({ ...prev, [letter]: !prev[letter] }));
  };

  const handleCategoryClick = (cat: Category) => {
    setOpen(false);
    navigate(`/catalog?category=${cat.id}`);
  };

  const grouped = groupCategories(categories);

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
        className={`fixed top-0 left-0 h-full z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
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
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#e31e24] hover:bg-[#fff0f0] border-b border-[#f0f0f0] transition-colors text-left"
        >
          <Icon name="List" size={15} />
          Все товары
        </button>

        {/* Categories list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col gap-1 p-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          )}

          {!loading && grouped.length === 0 && (
            <p className="text-xs text-gray-400 px-4 py-4">Категории не найдены</p>
          )}

          {!loading && grouped.map(([letter, cats]) => (
            <div key={letter}>
              {/* Group header — раскрываемый */}
              <button
                onClick={() => toggleGroup(letter)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors border-b border-[#f5f5f5]"
              >
                <span>{letter}</span>
                <Icon
                  name={expanded[letter] ? "ChevronUp" : "ChevronDown"}
                  size={13}
                  className="text-gray-400"
                />
              </button>

              {/* Subcategories */}
              {expanded[letter] && (
                <div className="bg-[#fafafa]">
                  {cats.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className="w-full flex items-center justify-between px-5 py-2 text-sm text-gray-700 hover:bg-[#fff0f0] hover:text-[#e31e24] transition-colors text-left"
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.count > 0 && (
                        <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">
                          {cat.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
