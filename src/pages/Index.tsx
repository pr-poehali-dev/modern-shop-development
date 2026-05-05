import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/575eebb4-f8b1-4468-a7ea-170e2db77a96.jpg";

const PRODUCTS = [
  { id: 1, name: "Смартфон ProMax X15", price: 89990, oldPrice: 109990, category: "Смартфоны", tag: "Хит", rating: 4.9, reviews: 342, img: "📱", color: "Чёрный", memory: "256GB" },
  { id: 2, name: "Наушники SoundPro Neo", price: 14990, oldPrice: 19990, category: "Аудио", tag: "Скидка", rating: 4.8, reviews: 215, img: "🎧", color: "Белый", memory: null },
  { id: 3, name: "Ноутбук UltraBook Air", price: 129990, oldPrice: null, category: "Ноутбуки", tag: "Новинка", rating: 4.7, reviews: 98, img: "💻", color: "Серебро", memory: "512GB" },
  { id: 4, name: "Умные часы FitPro 5", price: 29990, oldPrice: 34990, category: "Гаджеты", tag: "Скидка", rating: 4.6, reviews: 187, img: "⌚", color: "Чёрный", memory: null },
  { id: 5, name: "Планшет TabMax Pro", price: 54990, oldPrice: null, category: "Планшеты", tag: "Новинка", rating: 4.5, reviews: 64, img: "📟", color: "Серый", memory: "128GB" },
  { id: 6, name: "Колонка BoomBox Ultra", price: 9990, oldPrice: 12990, category: "Аудио", tag: "Хит", rating: 4.8, reviews: 293, img: "🔊", color: "Чёрный", memory: null },
  { id: 7, name: "Клавиатура MechX Pro", price: 7990, oldPrice: null, category: "Периферия", tag: "Новинка", rating: 4.7, reviews: 45, img: "⌨️", color: "RGB", memory: null },
  { id: 8, name: "Камера VisionX 4K", price: 79990, oldPrice: 95000, category: "Фото", tag: "Скидка", rating: 4.9, reviews: 128, img: "📷", color: "Чёрный", memory: null },
];

const CATEGORIES = ["Все", "Смартфоны", "Ноутбуки", "Планшеты", "Аудио", "Гаджеты", "Периферия", "Фото"];

const CAT_ICONS: Record<string, string> = {
  "Все": "LayoutGrid",
  "Смартфоны": "Smartphone",
  "Ноутбуки": "Laptop",
  "Планшеты": "Tablet",
  "Аудио": "Headphones",
  "Гаджеты": "Watch",
  "Периферия": "Keyboard",
  "Фото": "Camera",
};

const REVIEWS = [
  { name: "Алексей М.", rating: 5, text: "Заказал смартфон — пришёл за 2 дня. Упаковка отличная, товар полностью соответствует описанию!", date: "15 апреля 2026", avatar: "А" },
  { name: "Мария С.", rating: 5, text: "Очень довольна покупкой наушников. Звук потрясающий, шумоподавление работает на 5+. Рекомендую!", date: "8 апреля 2026", avatar: "М" },
  { name: "Дмитрий К.", rating: 4, text: "Хороший магазин, широкий ассортимент. Доставка немного задержалась, но поддержка помогла разобраться.", date: "2 апреля 2026", avatar: "Д" },
  { name: "Елена В.", rating: 5, text: "Купила ноутбук — это просто зверь! Работает быстро, дизайн крутой. Цена чуть выше, но качество того стоит!", date: "28 марта 2026", avatar: "Е" },
  { name: "Игорь Р.", rating: 5, text: "Отличный сервис! Консультант помог выбрать умные часы под мои нужды. Теперь постоянный клиент.", date: "20 марта 2026", avatar: "И" },
  { name: "Светлана Б.", rating: 5, text: "Заказываю уже третий раз. Качество, скорость и цены — лучшие на рынке. Советую всем!", date: "14 марта 2026", avatar: "С" },
];

type Page = "home" | "catalog" | "cart" | "contacts" | "delivery" | "reviews" | "about";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= rating ? "star-filled" : "star-empty"} style={{ fontSize: 12 }}>★</span>
      ))}
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const cls = tag === "Хит" ? "tag-hit" : tag === "Новинка" ? "tag-new" : "tag-sale";
  return <span className={cls}>{tag}</span>;
}

export default function Index() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [category, setCategory] = useState("Все");
  const [priceRange, setPriceRange] = useState(200000);
  const [cart, setCart] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const filteredProducts = PRODUCTS.filter(p => {
    const catOk = category === "Все" || p.category === category;
    const priceOk = p.price <= priceRange;
    const searchOk = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return catOk && priceOk && searchOk;
  });

  const addToCart = (id: number) => {
    setCart(prev => [...prev, id]);
    setAddedIds(prev => [...prev, id]);
    setTimeout(() => setAddedIds(prev => prev.filter(x => x !== id)), 1500);
  };
  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, id) => {
    const p = PRODUCTS.find(pr => pr.id === id);
    return sum + (p?.price || 0);
  }, 0);

  const nav: { id: Page; label: string }[] = [
    { id: "home", label: "Главная" },
    { id: "catalog", label: "Каталог" },
    { id: "delivery", label: "Доставка" },
    { id: "reviews", label: "Отзывы" },
    { id: "about", label: "О магазине" },
    { id: "contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: 'var(--brand-gray)' }}>

      {/* Top utility bar */}
      <div className="top-bar hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span>📍 Москва</span>
            <span>|</span>
            <span>Пн–Вс: 09:00–22:00</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Сравнение</span>
            <span>Избранное</span>
            <span>Личный кабинет</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => setActivePage("home")}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div
              className="flex items-center justify-center rounded"
              style={{ background: 'white', width: 42, height: 42 }}
            >
              <span style={{ color: 'var(--brand-red)', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 18 }}>N</span>
            </div>
            <div>
              <div style={{ color: 'white', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>NOVA</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Roboto', fontWeight: 400, fontSize: 10, letterSpacing: 2 }}>ЭЛЕКТРОНИКА</div>
            </div>
          </button>

          {/* Catalog Button */}
          <button
            onClick={() => setActivePage("catalog")}
            className="hidden md:flex items-center gap-2 flex-shrink-0 btn-red"
            style={{ borderRadius: 4, padding: '10px 16px', fontSize: 13, fontWeight: 600 }}
          >
            <Icon name="LayoutGrid" size={16} />
            Каталог
          </button>

          {/* Search */}
          <div className="flex-1 flex items-center" style={{ background: 'white', borderRadius: 4, overflow: 'hidden', maxWidth: 600 }}>
            <input
              className="search-input"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setActivePage('catalog')}
            />
            <button className="search-btn" onClick={() => setActivePage('catalog')}>
              <Icon name="Search" size={16} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setActivePage("cart")}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1"
              style={{ color: 'white' }}
            >
              <div className="relative">
                <Icon name="ShoppingCart" size={22} />
                {cartCount > 0 && (
                  <span className="cart-badge font-display">{cartCount}</span>
                )}
              </div>
              <span style={{ fontSize: 11 }} className="hidden md:block">Корзина</span>
            </button>

            <button
              className="md:hidden flex items-center justify-center p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: 'white' }}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {/* Category nav bar */}
        <div className="cat-nav hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto scrollbar-hide">
            {nav.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`cat-nav-item ${activePage === item.id ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-4 py-2">
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                <Icon name="Phone" size={12} className="inline mr-1" />
                8-800-555-00-00
              </span>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{ background: '#1e1e1e', borderTop: '1px solid rgba(255,255,255,0.1)' }} className="md:hidden">
            {nav.map(item => (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}
                className="block w-full text-left cat-nav-item border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main>

        {/* ─── HOME ─── */}
        {activePage === "home" && (
          <div>
            {/* Hero */}
            <section className="hero-banner">
              <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 z-10">
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded" style={{ background: 'var(--brand-red)', color: 'white', fontSize: 12, fontWeight: 700 }}>
                    🔥 РАСПРОДАЖА — ДО −40%
                  </div>
                  <h1 className="font-display text-white mb-4 animate-fade-in" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1 }}>
                    ТЕХНИКА ДЛЯ<br />
                    <span style={{ color: 'var(--brand-red)' }}>ВАШЕЙ ЖИЗНИ</span>
                  </h1>
                  <p className="mb-8 animate-fade-in stagger-2" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 460 }}>
                    Широкий выбор электроники и гаджетов. Официальная гарантия, доставка по всей России, самовывоз из 100+ магазинов.
                  </p>
                  <div className="flex flex-wrap gap-3 animate-fade-in stagger-3">
                    <button onClick={() => setActivePage("catalog")} className="btn-red" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 700, borderRadius: 4 }}>
                      Перейти в каталог
                    </button>
                    <button onClick={() => setActivePage("delivery")} className="btn-outline-red" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 700, borderRadius: 4, borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                      Доставка и оплата
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-8 mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {[["50 000+", "товаров в каталоге"], ["100+", "магазинов по России"], ["4.9★", "средний рейтинг"], ["24/7", "поддержка"]].map(([val, label]) => (
                      <div key={label} className="animate-fade-in stagger-4">
                        <div className="font-display font-bold text-white" style={{ fontSize: 22 }}>{val}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 max-w-md hidden md:block">
                  <img
                    src={HERO_IMAGE}
                    alt="Электроника"
                    className="w-full rounded-lg"
                    style={{ opacity: 0.9, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
                  />
                </div>

                {/* BG decoration */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, var(--brand-red) 0%, transparent 60%)' }} />
              </div>
            </section>

            {/* Categories quick access */}
            <section className="py-8 max-w-7xl mx-auto px-4">
              <h2 className="section-title mb-6">Категории товаров</h2>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {CATEGORIES.filter(c => c !== "Все").map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setActivePage("catalog"); }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:shadow-md"
                    style={{ background: 'white', border: '1px solid var(--brand-gray-mid)', fontSize: 11, color: 'var(--brand-text)', fontWeight: 500 }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(224,16,16,0.07)' }}>
                      <Icon name={CAT_ICONS[cat]} size={20} style={{ color: 'var(--brand-red)' }} />
                    </div>
                    <span className="text-center leading-tight">{cat}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Hit products */}
            <section className="py-4 max-w-7xl mx-auto px-4 pb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">Хиты продаж</h2>
                <button
                  onClick={() => setActivePage("catalog")}
                  className="text-sm font-medium flex items-center gap-1"
                  style={{ color: 'var(--brand-red)' }}
                >
                  Все товары <Icon name="ChevronRight" size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PRODUCTS.filter(p => p.tag === "Хит" || p.tag === "Скидка").slice(0, 4).map((product, i) => (
                  <div key={product.id} className={`product-card rounded animate-fade-in stagger-${i + 1}`}>
                    <div className="relative p-4 flex flex-col items-center" style={{ borderBottom: '1px solid var(--brand-gray-mid)', minHeight: 140 }}>
                      <div className="absolute top-2 left-2">
                        <TagBadge tag={product.tag} />
                      </div>
                      <span style={{ fontSize: 56 }}>{product.img}</span>
                    </div>
                    <div className="p-3">
                      <p style={{ fontSize: 13, color: 'var(--brand-text)', fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <Stars rating={Math.floor(product.rating)} />
                        <span style={{ fontSize: 11, color: 'var(--brand-gray-dark)' }}>{product.reviews}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="price-main" style={{ fontSize: 18 }}>{product.price.toLocaleString()} ₽</span>
                        {product.oldPrice && <span className="price-old">{product.oldPrice.toLocaleString()} ₽</span>}
                      </div>
                      <button
                        className="btn-red w-full"
                        onClick={() => addToCart(product.id)}
                      >
                        {addedIds.includes(product.id) ? "✓ Добавлено" : "В корзину"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section style={{ background: 'white', borderTop: '1px solid var(--brand-gray-mid)', borderBottom: '1px solid var(--brand-gray-mid)' }} className="py-10">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: "Truck", title: "Быстрая доставка", desc: "По Москве за 1 день, по России за 2-5 дней" },
                    { icon: "ShieldCheck", title: "Официальная гарантия", desc: "На все товары от 1 до 3 лет гарантии" },
                    { icon: "RotateCcw", title: "Возврат 30 дней", desc: "Вернём деньги без лишних вопросов" },
                    { icon: "Headset", title: "Поддержка 24/7", desc: "Онлайн-консультант всегда на связи" },
                  ].map((item, i) => (
                    <div key={item.title} className={`info-card animate-fade-in stagger-${i + 1}`}>
                      <div className="info-card-icon">
                        <Icon name={item.icon} size={22} style={{ color: 'var(--brand-red)' }} />
                      </div>
                      <div className="font-display font-bold mb-1" style={{ fontSize: 14, color: 'var(--brand-text)' }}>{item.title}</div>
                      <p style={{ fontSize: 12, color: 'var(--brand-gray-dark)', lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* New products */}
            <section className="py-8 max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">Новинки</h2>
                <button
                  onClick={() => setActivePage("catalog")}
                  className="text-sm font-medium flex items-center gap-1"
                  style={{ color: 'var(--brand-red)' }}
                >
                  Смотреть все <Icon name="ChevronRight" size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PRODUCTS.filter(p => p.tag === "Новинка").map((product, i) => (
                  <div key={product.id} className={`product-card rounded animate-fade-in stagger-${i + 1}`}>
                    <div className="relative p-4 flex flex-col items-center" style={{ borderBottom: '1px solid var(--brand-gray-mid)', minHeight: 140 }}>
                      <div className="absolute top-2 left-2">
                        <TagBadge tag={product.tag} />
                      </div>
                      {product.memory && (
                        <div className="absolute top-2 right-2" style={{ fontSize: 10, color: 'var(--brand-gray-dark)', background: 'var(--brand-gray)', padding: '1px 5px', borderRadius: 2 }}>
                          {product.memory}
                        </div>
                      )}
                      <span style={{ fontSize: 56 }}>{product.img}</span>
                    </div>
                    <div className="p-3">
                      <p style={{ fontSize: 13, color: 'var(--brand-text)', fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <Stars rating={Math.floor(product.rating)} />
                        <span style={{ fontSize: 11, color: 'var(--brand-gray-dark)' }}>{product.reviews}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="price-main" style={{ fontSize: 18 }}>{product.price.toLocaleString()} ₽</span>
                        {product.oldPrice && <span className="price-old">{product.oldPrice.toLocaleString()} ₽</span>}
                      </div>
                      <button className="btn-red w-full" onClick={() => addToCart(product.id)}>
                        {addedIds.includes(product.id) ? "✓ Добавлено" : "В корзину"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ─── CATALOG ─── */}
        {activePage === "catalog" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="breadcrumb mb-4">Главная → <span>Каталог</span></div>
            <div className="flex gap-6">
              {/* Sidebar */}
              <aside className="hidden md:block w-56 flex-shrink-0">
                <div className="sidebar-block">
                  <div className="sidebar-title">Категории</div>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="flex items-center gap-2 w-full text-left py-2 px-2 rounded transition-all"
                      style={{
                        fontSize: 13,
                        color: category === cat ? 'var(--brand-red)' : 'var(--brand-text)',
                        background: category === cat ? 'rgba(224,16,16,0.06)' : 'transparent',
                        fontWeight: category === cat ? 600 : 400,
                        borderLeft: category === cat ? '3px solid var(--brand-red)' : '3px solid transparent',
                      }}
                    >
                      <Icon name={CAT_ICONS[cat]} size={14} />
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="sidebar-block">
                  <div className="sidebar-title">Цена, ₽</div>
                  <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--brand-gray-dark)' }}>
                    <span>0</span>
                    <span style={{ color: 'var(--brand-red)', fontWeight: 700 }}>{priceRange.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={200000}
                    step={5000}
                    value={priceRange}
                    onChange={e => setPriceRange(Number(e.target.value))}
                  />
                </div>
              </aside>

              {/* Products grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="font-display font-bold" style={{ fontSize: 22, color: 'var(--brand-text)' }}>
                    {category === "Все" ? "Все товары" : category}
                    <span className="ml-2 font-body" style={{ fontSize: 14, color: 'var(--brand-gray-dark)', fontWeight: 400 }}>({filteredProducts.length} товаров)</span>
                  </h1>
                </div>

                {/* Mobile categories */}
                <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-all"
                      style={{
                        background: category === cat ? 'var(--brand-red)' : 'white',
                        color: category === cat ? 'white' : 'var(--brand-text)',
                        border: '1px solid var(--brand-gray-mid)',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20" style={{ color: 'var(--brand-gray-dark)' }}>
                    <div style={{ fontSize: 48 }}>🔍</div>
                    <p className="mt-3">Товары не найдены. Попробуйте изменить фильтры.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product, i) => (
                      <div key={product.id} className={`product-card rounded animate-fade-in stagger-${(i % 6) + 1}`}>
                        <div className="relative p-4 flex flex-col items-center" style={{ borderBottom: '1px solid var(--brand-gray-mid)', minHeight: 140 }}>
                          <div className="absolute top-2 left-2">
                            <TagBadge tag={product.tag} />
                          </div>
                          {product.memory && (
                            <div className="absolute top-2 right-2" style={{ fontSize: 10, color: 'var(--brand-gray-dark)', background: 'var(--brand-gray)', padding: '1px 5px', borderRadius: 2 }}>
                              {product.memory}
                            </div>
                          )}
                          <span style={{ fontSize: 52 }}>{product.img}</span>
                        </div>
                        <div className="p-3">
                          <p style={{ fontSize: 12, color: 'var(--brand-gray-dark)', marginBottom: 2 }}>{product.category}</p>
                          <p style={{ fontSize: 13, color: 'var(--brand-text)', fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</p>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Stars rating={Math.floor(product.rating)} />
                            <span style={{ fontSize: 11, color: 'var(--brand-gray-dark)' }}>({product.reviews})</span>
                          </div>
                          {product.oldPrice && (
                            <div className="price-old mb-0.5">{product.oldPrice.toLocaleString()} ₽</div>
                          )}
                          <div className="price-main mb-3" style={{ fontSize: 18 }}>{product.price.toLocaleString()} ₽</div>
                          <button className="btn-red w-full" onClick={() => addToCart(product.id)}>
                            {addedIds.includes(product.id) ? "✓ Добавлено" : "В корзину"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── CART ─── */}
        {activePage === "cart" && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="breadcrumb mb-4">Главная → <span>Корзина</span></div>
            <h1 className="font-display font-bold mb-6" style={{ fontSize: 26, color: 'var(--brand-text)' }}>
              Корзина
              {cartCount > 0 && <span className="ml-2 font-body" style={{ fontSize: 16, color: 'var(--brand-gray-dark)', fontWeight: 400 }}>({cartCount} товаров)</span>}
            </h1>

            {cart.length === 0 ? (
              <div className="text-center py-20" style={{ background: 'white', border: '1px solid var(--brand-gray-mid)', borderRadius: 4 }}>
                <div style={{ fontSize: 64 }}>🛒</div>
                <p className="mt-4 mb-6 font-display font-bold" style={{ fontSize: 20, color: 'var(--brand-text)' }}>Корзина пуста</p>
                <button onClick={() => setActivePage("catalog")} className="btn-red" style={{ padding: '12px 32px', fontSize: 15, borderRadius: 4 }}>
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  {Array.from(new Set(cart)).map(id => {
                    const product = PRODUCTS.find(p => p.id === id);
                    if (!product) return null;
                    const count = cart.filter(c => c === id).length;
                    return (
                      <div key={id} className="flex items-center gap-4 p-4 mb-3 animate-fade-in" style={{ background: 'white', border: '1px solid var(--brand-gray-mid)', borderRadius: 4 }}>
                        <span style={{ fontSize: 40 }}>{product.img}</span>
                        <div className="flex-1">
                          <p className="font-medium mb-1" style={{ fontSize: 14, color: 'var(--brand-text)' }}>{product.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--brand-gray-dark)' }}>{product.color}{product.memory ? `, ${product.memory}` : ''}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span style={{ fontSize: 16, color: 'var(--brand-gray-dark)' }}>× {count}</span>
                            <button
                              onClick={() => setCart(prev => { const idx = prev.lastIndexOf(id); return prev.filter((_, i) => i !== idx); })}
                              style={{ fontSize: 12, color: 'var(--brand-red)', cursor: 'pointer' }}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="price-main" style={{ fontSize: 18 }}>{(product.price * count).toLocaleString()} ₽</div>
                          {product.oldPrice && <div className="price-old">{product.oldPrice.toLocaleString()} ₽/шт</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="w-full md:w-72 flex-shrink-0">
                  <div style={{ background: 'white', border: '1px solid var(--brand-gray-mid)', borderRadius: 4, padding: 20 }}>
                    <h3 className="font-display font-bold mb-4" style={{ fontSize: 16, borderBottom: '2px solid var(--brand-red)', paddingBottom: 8 }}>Итого</h3>
                    <div className="flex justify-between mb-2 text-sm" style={{ color: 'var(--brand-gray-dark)' }}>
                      <span>Товары ({cartCount} шт.)</span>
                      <span>{cartTotal.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm" style={{ color: 'var(--brand-gray-dark)' }}>
                      <span>Доставка</span>
                      <span style={{ color: '#2ecc71', fontWeight: 600 }}>Бесплатно</span>
                    </div>
                    <div className="flex justify-between font-bold mt-4 pt-4" style={{ borderTop: '1px solid var(--brand-gray-mid)', fontSize: 20, color: 'var(--brand-text)' }}>
                      <span>К оплате</span>
                      <span className="price-main">{cartTotal.toLocaleString()} ₽</span>
                    </div>
                    <button className="btn-red w-full mt-5" style={{ padding: '14px', fontSize: 15, fontWeight: 700, borderRadius: 4 }}>
                      Оформить заказ
                    </button>
                    <p style={{ fontSize: 11, color: 'var(--brand-gray-dark)', textAlign: 'center', marginTop: 10 }}>
                      Нажимая кнопку, вы соглашаетесь с условиями оферты
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── DELIVERY ─── */}
        {activePage === "delivery" && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="breadcrumb mb-4">Главная → <span>Доставка и оплата</span></div>
            <h1 className="font-display font-bold mb-6" style={{ fontSize: 26, color: 'var(--brand-text)' }}>Доставка и оплата</h1>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { icon: "Truck", title: "Курьерская доставка", items: ["По Москве: 1 день, от 299 ₽", "По России: 2–7 дней, от 399 ₽", "При заказе от 5 000 ₽ — бесплатно"] },
                { icon: "Store", title: "Самовывоз", items: ["Более 100 магазинов по России", "Готовность через 2 часа", "Бесплатно"] },
                { icon: "CreditCard", title: "Оплата онлайн", items: ["Карты Visa, MasterCard, МИР", "СБП — без комиссии", "Рассрочка 0% на 12 месяцев"] },
                { icon: "Banknote", title: "Оплата при получении", items: ["Наличными курьеру", "Картой курьеру", "В пунктах выдачи"] },
              ].map((block, i) => (
                <div key={block.title} className={`animate-fade-in stagger-${i+1}`} style={{ background: 'white', border: '1px solid var(--brand-gray-mid)', borderRadius: 4, padding: 20 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="info-card-icon" style={{ width: 40, height: 40 }}>
                      <Icon name={block.icon} size={20} style={{ color: 'var(--brand-red)' }} />
                    </div>
                    <h3 className="font-display font-bold" style={{ fontSize: 16 }}>{block.title}</h3>
                  </div>
                  <ul>
                    {block.items.map(item => (
                      <li key={item} className="flex items-start gap-2 mb-2 text-sm" style={{ color: 'var(--brand-gray-dark)' }}>
                        <span style={{ color: 'var(--brand-red)', marginTop: 2 }}>●</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(224,16,16,0.05)', border: '1px solid rgba(224,16,16,0.2)', borderRadius: 4, padding: 20 }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Info" size={18} style={{ color: 'var(--brand-red)' }} />
                <span className="font-display font-bold" style={{ fontSize: 14, color: 'var(--brand-red)' }}>Важно</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--brand-text)' }}>
                Сроки доставки могут увеличиться в праздничные дни. При заказе крупногабаритной техники возможна дополнительная оплата за подъём на этаж.
              </p>
            </div>
          </div>
        )}

        {/* ─── REVIEWS ─── */}
        {activePage === "reviews" && (
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="breadcrumb mb-4">Главная → <span>Отзывы</span></div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display font-bold" style={{ fontSize: 26, color: 'var(--brand-text)' }}>Отзывы покупателей</h1>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 32, fontFamily: 'Montserrat', fontWeight: 900, color: 'var(--brand-red)' }}>4.9</span>
                <div>
                  <Stars rating={5} />
                  <p style={{ fontSize: 11, color: 'var(--brand-gray-dark)' }}>1 273 отзыва</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {REVIEWS.map((review, i) => (
                <div key={review.name} className={`review-card animate-fade-in stagger-${(i % 6) + 1}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white flex-shrink-0"
                      style={{ background: 'var(--brand-red)', fontSize: 16 }}
                    >
                      {review.avatar}
                    </div>
                    <div>
                      <p className="font-medium" style={{ fontSize: 14, color: 'var(--brand-text)' }}>{review.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--brand-gray-dark)' }}>{review.date}</p>
                    </div>
                    <div className="ml-auto">
                      <Stars rating={review.rating} />
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--brand-gray-dark)', lineHeight: 1.6 }}>{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ABOUT ─── */}
        {activePage === "about" && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="breadcrumb mb-4">Главная → <span>О магазине</span></div>
            <h1 className="font-display font-bold mb-6" style={{ fontSize: 26, color: 'var(--brand-text)' }}>О магазине</h1>

            <div className="mb-6 p-6 animate-fade-in" style={{ background: 'white', border: '1px solid var(--brand-gray-mid)', borderRadius: 4 }}>
              <h2 className="font-display font-bold mb-4" style={{ fontSize: 18, color: 'var(--brand-text)', borderLeft: '4px solid var(--brand-red)', paddingLeft: 12 }}>
                Наша история
              </h2>
              <p style={{ fontSize: 14, color: 'var(--brand-gray-dark)', lineHeight: 1.8 }}>
                NOVA Электроника — российский ритейлер цифровой и бытовой техники с 2015 года. Мы работаем только с официальными поставщиками, обеспечивая каждому покупателю оригинальные товары с полной гарантией производителя.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                { icon: "Award", title: "Качество", desc: "Только оригинальные товары от официальных дистрибьюторов. Каждая партия проходит контроль качества." },
                { icon: "Users", title: "Команда", desc: "Более 500 сотрудников по всей России. Профессиональные консультанты помогут с выбором." },
                { icon: "MapPin", title: "Покрытие", desc: "100+ магазинов в 50 городах России. Доставка в любую точку страны." },
                { icon: "TrendingUp", title: "Рост", desc: "Ежегодно открываем новые магазины и расширяем ассортимент. С нами выгодно покупать технику." },
              ].map((item, i) => (
                <div key={item.title} className={`animate-fade-in stagger-${i+1}`} style={{ background: 'white', border: '1px solid var(--brand-gray-mid)', borderRadius: 4, padding: 20, display: 'flex', gap: 16 }}>
                  <div className="info-card-icon flex-shrink-0" style={{ width: 40, height: 40 }}>
                    <Icon name={item.icon} size={20} style={{ color: 'var(--brand-red)' }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold mb-1" style={{ fontSize: 15 }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--brand-gray-dark)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CONTACTS ─── */}
        {activePage === "contacts" && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="breadcrumb mb-4">Главная → <span>Контакты</span></div>
            <h1 className="font-display font-bold mb-6" style={{ fontSize: 26, color: 'var(--brand-text)' }}>Контакты</h1>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                { icon: "Phone", title: "Телефон", lines: ["8-800-555-00-00 (бесплатно)", "+7 (495) 555-00-01"] },
                { icon: "Mail", title: "Email", lines: ["info@nova-shop.ru", "support@nova-shop.ru"] },
                { icon: "MapPin", title: "Адрес", lines: ["г. Москва, ул. Тверская, 1", "ТЦ Европейский, 3 этаж"] },
                { icon: "Clock", title: "Режим работы", lines: ["Пн–Пт: 09:00–21:00", "Сб–Вс: 10:00–20:00"] },
              ].map((item, i) => (
                <div key={item.title} className={`animate-fade-in stagger-${i+1}`} style={{ background: 'white', border: '1px solid var(--brand-gray-mid)', borderRadius: 4, padding: 20, display: 'flex', gap: 16 }}>
                  <div className="info-card-icon flex-shrink-0" style={{ width: 44, height: 44 }}>
                    <Icon name={item.icon} size={22} style={{ color: 'var(--brand-red)' }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold mb-2" style={{ fontSize: 15 }}>{item.title}</h3>
                    {item.lines.map(line => (
                      <p key={line} style={{ fontSize: 14, color: 'var(--brand-gray-dark)', marginBottom: 4 }}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', border: '1px solid var(--brand-gray-mid)', borderRadius: 4, padding: 24 }}>
              <h2 className="font-display font-bold mb-4" style={{ fontSize: 18, borderLeft: '4px solid var(--brand-red)', paddingLeft: 12 }}>Напишите нам</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={{ fontSize: 13, color: 'var(--brand-text)', display: 'block', marginBottom: 6 }}>Ваше имя</label>
                  <input
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{ border: '1px solid var(--brand-gray-mid)', outline: 'none', fontFamily: 'Roboto' }}
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--brand-text)', display: 'block', marginBottom: 6 }}>Телефон или Email</label>
                  <input
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{ border: '1px solid var(--brand-gray-mid)', outline: 'none', fontFamily: 'Roboto' }}
                    placeholder="info@email.ru"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label style={{ fontSize: 13, color: 'var(--brand-text)', display: 'block', marginBottom: 6 }}>Сообщение</label>
                <textarea
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{ border: '1px solid var(--brand-gray-mid)', outline: 'none', fontFamily: 'Roboto', resize: 'vertical', minHeight: 100 }}
                  placeholder="Ваш вопрос..."
                />
              </div>
              <button className="btn-red" style={{ padding: '12px 32px', fontSize: 15, fontWeight: 700, borderRadius: 4 }}>
                Отправить сообщение
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer-main mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--brand-red)' }}>
                  <span style={{ color: 'white', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 16 }}>N</span>
                </div>
                <span style={{ color: 'white', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 18 }}>NOVA</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Широкий выбор электроники с официальной гарантией и быстрой доставкой.
              </p>
            </div>
            <div>
              <div className="footer-title">Покупателям</div>
              {["Каталог", "Доставка и оплата", "Возврат", "Гарантия"].map(l => (
                <span key={l} className="footer-link">{l}</span>
              ))}
            </div>
            <div>
              <div className="footer-title">Компания</div>
              {["О магазине", "Вакансии", "Партнёрам", "Пресса"].map(l => (
                <span key={l} className="footer-link">{l}</span>
              ))}
            </div>
            <div>
              <div className="footer-title">Контакты</div>
              <p style={{ fontSize: 13, color: 'white', fontWeight: 700, marginBottom: 4 }}>8-800-555-00-00</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Пн–Вс: 09:00–22:00</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>info@nova-shop.ru</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.4)' }} className="flex flex-col md:flex-row justify-between gap-2">
            <span>© 2026 NOVA Электроника. Все права защищены.</span>
            <span>ИНН 7701234567 | ОГРН 1157700123456</span>
          </div>
        </div>
      </footer>
    </div>
  );
}