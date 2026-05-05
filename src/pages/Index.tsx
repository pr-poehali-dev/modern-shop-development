import { useState } from "react";
import Icon from "@/components/ui/icon";

type IconName = Parameters<typeof Icon>[0]["name"];

const HERO_IMAGE = "https://cdn.poehali.dev/projects/4e0a44ed-16f9-41e2-b08b-ecbe04285669/files/fde92df7-6b7a-426a-993e-a105f823ede2.jpg";

const PRODUCTS = [
  { id: 1, name: "Смартфон ProMax X15", price: 89990, oldPrice: 109990, category: "Электроника", tag: "Хит", rating: 4.9, reviews: 342, img: "📱", color: "Чёрный", memory: "256GB" },
  { id: 2, name: "Наушники SoundPro Neo", price: 14990, oldPrice: 19990, category: "Аудио", tag: "Скидка", rating: 4.8, reviews: 215, img: "🎧", color: "Белый", memory: null },
  { id: 3, name: "Ноутбук UltraBook Air", price: 129990, oldPrice: null, category: "Электроника", tag: "Новинка", rating: 4.7, reviews: 98, img: "💻", color: "Серебро", memory: "512GB" },
  { id: 4, name: "Умные часы FitPro 5", price: 29990, oldPrice: 34990, category: "Гаджеты", tag: "Скидка", rating: 4.6, reviews: 187, img: "⌚", color: "Чёрный", memory: null },
  { id: 5, name: "Планшет TabMax Pro", price: 54990, oldPrice: null, category: "Электроника", tag: "Новинка", rating: 4.5, reviews: 64, img: "📟", color: "Серый", memory: "128GB" },
  { id: 6, name: "Колонка BoomBox Ultra", price: 9990, oldPrice: 12990, category: "Аудио", tag: "Хит", rating: 4.8, reviews: 293, img: "🔊", color: "Чёрный", memory: null },
  { id: 7, name: "Клавиатура MechX Pro", price: 7990, oldPrice: null, category: "Периферия", tag: "Новинка", rating: 4.7, reviews: 45, img: "⌨️", color: "RGB", memory: null },
  { id: 8, name: "Камера VisionX 4K", price: 79990, oldPrice: 95000, category: "Фото", tag: "Скидка", rating: 4.9, reviews: 128, img: "📷", color: "Чёрный", memory: null },
];

const CATEGORIES = ["Все", "Электроника", "Аудио", "Гаджеты", "Периферия", "Фото"];

const REVIEWS = [
  { name: "Алексей М.", rating: 5, text: "Заказал смартфон — пришёл за 2 дня. Упаковка отличная, товар полностью соответствует описанию. Буду заказывать ещё!", date: "15 апреля 2026", avatar: "А" },
  { name: "Мария С.", rating: 5, text: "Очень довольна покупкой наушников. Звук потрясающий, шумоподавление работает на 5+. Рекомендую магазин всем!", date: "8 апреля 2026", avatar: "М" },
  { name: "Дмитрий К.", rating: 4, text: "Хороший магазин, широкий ассортимент. Доставка немного задержалась, но поддержка оперативно помогла разобраться.", date: "2 апреля 2026", avatar: "Д" },
  { name: "Елена В.", rating: 5, text: "Купила ноутбук — это просто зверь! Работает быстро, дизайн крутой. Цена чуть выше, но качество того стоит!", date: "28 марта 2026", avatar: "Е" },
  { name: "Игорь Р.", rating: 5, text: "Отличный сервис! Консультант помог выбрать умные часы под мои нужды. Теперь постоянный клиент.", date: "20 марта 2026", avatar: "И" },
  { name: "Светлана Б.", rating: 5, text: "Заказываю уже третий раз. Качество, скорость и цены — лучшие на рынке. Советую всем знакомым!", date: "14 марта 2026", avatar: "С" },
];

type Page = "home" | "catalog" | "cart" | "contacts" | "delivery" | "reviews" | "about";

export default function Index() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [category, setCategory] = useState("Все");
  const [priceRange, setPriceRange] = useState(200000);
  const [cart, setCart] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredProducts = PRODUCTS.filter(p => {
    const catOk = category === "Все" || p.category === category;
    const priceOk = p.price <= priceRange;
    return catOk && priceOk;
  });

  const addToCart = (id: number) => setCart(prev => [...prev, id]);
  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, id) => {
    const p = PRODUCTS.find(pr => pr.id === id);
    return sum + (p?.price || 0);
  }, 0);

  const nav: { id: Page; label: string }[] = [
    { id: "home", label: "Главная" },
    { id: "catalog", label: "Каталог" },
    { id: "cart", label: "Корзина" },
    { id: "delivery", label: "Доставка" },
    { id: "reviews", label: "Отзывы" },
    { id: "about", label: "О магазине" },
    { id: "contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: 'var(--dark-bg)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setActivePage("home")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center text-white font-display font-bold text-sm">N</div>
            <span className="font-display font-bold text-xl text-white tracking-wide">NOVA<span className="neon-purple">SHOP</span></span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            {nav.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`nav-link ${activePage === item.id ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setActivePage("cart")} className="relative p-2 rounded-lg glass-card hover:glow-purple transition-all">
              <Icon name="ShoppingCart" size={20} className="text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-btn text-white text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2 rounded-lg glass-card"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} className="text-white" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/5 p-4 flex flex-col gap-3">
            {nav.map(item => (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}
                className={`nav-link text-left py-2 ${activePage === item.id ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="pt-16">
        {/* HOME */}
        {activePage === "home" && (
          <div>
            {/* Hero */}
            <section className="relative min-h-screen flex items-center overflow-hidden grid-bg">
              <div className="absolute inset-0">
                <img src={HERO_IMAGE} alt="hero" className="w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,12,20,0.95) 0%, rgba(8,12,20,0.6) 50%, rgba(8,12,20,0.9) 100%)' }} />
              </div>

              <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-20 animate-float" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)' }} />
              <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-15 animate-float" style={{ animationDelay: '3s', background: 'radial-gradient(circle, rgba(0,245,255,0.8) 0%, transparent 70%)' }} />

              <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
                <div className="max-w-3xl">
                  <div className="tag-badge inline-block mb-6 animate-fade-in">🔥 Новая коллекция 2026</div>
                  <h1 className="font-display text-6xl md:text-8xl font-bold text-white leading-none mb-6 animate-fade-in stagger-1">
                    ТЕХНОЛОГИИ<br />
                    <span className="gradient-text">БУДУЩЕГО</span><br />
                    СЕГОДНЯ
                  </h1>
                  <p className="text-white/60 text-xl mb-10 animate-fade-in stagger-2 max-w-xl">
                    Лучшие гаджеты и электроника с доставкой по всей России. Официальная гарантия на каждый товар.
                  </p>
                  <div className="flex flex-wrap gap-4 animate-fade-in stagger-3">
                    <button onClick={() => setActivePage("catalog")} className="gradient-btn text-white px-8 py-4 rounded-xl font-display font-semibold text-lg tracking-wide uppercase">
                      Перейти в каталог
                    </button>
                    <button onClick={() => setActivePage("delivery")} className="px-8 py-4 rounded-xl font-display font-semibold text-lg tracking-wide uppercase text-white" style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}>
                      Условия доставки
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats bar */}
              <div className="absolute bottom-0 left-0 right-0 glass" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { val: "15 000+", label: "Товаров в наличии" },
                    { val: "250 000+", label: "Довольных клиентов" },
                    { val: "2–5 дней", label: "Срок доставки" },
                    { val: "2 года", label: "Гарантия" },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="font-display text-2xl font-bold gradient-text">{s.val}</div>
                      <div className="text-white/50 text-sm mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="tag-badge inline-block mb-3">Популярное</div>
                  <h2 className="font-display text-4xl font-bold text-white">ХИТЫ ПРОДАЖ</h2>
                </div>
                <button onClick={() => setActivePage("catalog")} className="flex items-center gap-2 neon-purple font-semibold hover:underline">
                  Все товары <Icon name="ArrowRight" size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PRODUCTS.slice(0, 4).map((p, i) => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart} delay={i} />
                ))}
              </div>
            </section>

            {/* Features */}
            <section className="py-16 glass-card mx-4 rounded-3xl mb-10 max-w-7xl md:mx-auto">
              <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { icon: "Truck", title: "Быстрая доставка", desc: "2-5 дней по России" },
                    { icon: "Shield", title: "Гарантия качества", desc: "2 года на каждый товар" },
                    { icon: "RefreshCw", title: "Возврат 30 дней", desc: "Без вопросов и споров" },
                    { icon: "Headphones", title: "Поддержка 24/7", desc: "Всегда на связи с вами" },
                  ].map((f, i) => (
                    <div key={i} className="text-center group">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                        <Icon name={f.icon as IconName} size={24} className="neon-purple" />
                      </div>
                      <div className="font-display font-semibold text-white text-sm uppercase tracking-wide mb-1">{f.title}</div>
                      <div className="text-white/50 text-xs">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center max-w-2xl mx-auto px-4 mb-10">
              <h2 className="font-display text-5xl font-bold text-white mb-4">ГОТОВ К <span className="gradient-text">ПОКУПКЕ?</span></h2>
              <p className="text-white/60 mb-8">Переходи в каталог и выбирай лучшее из более чем 15 000 товаров</p>
              <button onClick={() => setActivePage("catalog")} className="gradient-btn text-white px-10 py-5 rounded-xl font-display font-bold text-xl tracking-wide uppercase">
                Открыть каталог →
              </button>
            </section>
          </div>
        )}

        {/* CATALOG */}
        {activePage === "catalog" && (
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="mb-8">
              <div className="tag-badge inline-block mb-3">Ассортимент</div>
              <h1 className="font-display text-5xl font-bold text-white">КАТАЛОГ ТОВАРОВ</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters */}
              <aside className="lg:w-64 shrink-0">
                <div className="glass-card rounded-2xl p-5 sticky top-20">
                  <h3 className="font-display font-bold text-white text-lg uppercase mb-4 flex items-center gap-2">
                    <Icon name="SlidersHorizontal" size={18} className="neon-purple" />
                    Фильтры
                  </h3>

                  <div className="mb-6">
                    <div className="text-white/60 text-xs uppercase tracking-wide mb-3 font-semibold">Категория</div>
                    <div className="flex flex-col gap-2">
                      {CATEGORIES.map(c => (
                        <button
                          key={c}
                          onClick={() => setCategory(c)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${category === c ? 'gradient-btn text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-white/60 text-xs uppercase tracking-wide mb-3 font-semibold">Макс. цена</div>
                    <div className="font-display text-2xl font-bold neon-cyan mb-3">{priceRange.toLocaleString("ru")} ₽</div>
                    <input
                      type="range"
                      min={5000}
                      max={200000}
                      step={1000}
                      value={priceRange}
                      onChange={e => setPriceRange(+e.target.value)}
                      className="w-full accent-purple-500"
                    />
                    <div className="flex justify-between text-white/40 text-xs mt-1">
                      <span>5 000 ₽</span>
                      <span>200 000 ₽</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60 text-sm">Найдено: <span className="text-white font-semibold">{filteredProducts.length}</span> товаров</span>
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="glass-card rounded-2xl p-16 text-center">
                    <div className="text-5xl mb-4">😔</div>
                    <div className="font-display text-xl text-white">Товары не найдены</div>
                    <div className="text-white/50 mt-2">Попробуй изменить фильтры</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((p, i) => (
                      <ProductCard key={p.id} product={p} onAddToCart={addToCart} delay={i % 4} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CART */}
        {activePage === "cart" && (
          <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-8">
              <div className="tag-badge inline-block mb-3">Покупки</div>
              <h1 className="font-display text-5xl font-bold text-white">КОРЗИНА</h1>
            </div>

            {cart.length === 0 ? (
              <div className="glass-card rounded-3xl p-20 text-center">
                <div className="text-7xl mb-6 animate-float">🛒</div>
                <div className="font-display text-3xl font-bold text-white mb-3">Корзина пуста</div>
                <p className="text-white/50 mb-8">Добавьте товары из каталога, чтобы оформить заказ</p>
                <button onClick={() => setActivePage("catalog")} className="gradient-btn text-white px-8 py-4 rounded-xl font-display font-semibold text-lg uppercase tracking-wide">
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="glass-card rounded-2xl divide-y divide-white/5">
                  {[...new Set(cart)].map(id => {
                    const p = PRODUCTS.find(pr => pr.id === id)!;
                    const qty = cart.filter(c => c === id).length;
                    return (
                      <div key={id} className="flex items-center gap-4 p-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                          {p.img}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-white/50 text-sm">{p.category} · {p.color}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-display font-bold neon-cyan">{(p.price * qty).toLocaleString("ru")} ₽</div>
                          <div className="text-white/40 text-sm">{qty} шт.</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-white/60">Товаров: {cartCount} шт.</span>
                    <span className="font-display text-xl font-bold text-white">Итого: <span className="neon-cyan">{cartTotal.toLocaleString("ru")} ₽</span></span>
                  </div>
                  <button className="w-full gradient-btn text-white py-4 rounded-xl font-display font-bold text-lg uppercase tracking-wide">
                    Оформить заказ
                  </button>
                  <p className="text-white/30 text-xs text-center mt-3">Нажмите для перехода к оплате</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DELIVERY */}
        {activePage === "delivery" && (
          <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-10">
              <div className="tag-badge inline-block mb-3">Логистика</div>
              <h1 className="font-display text-5xl font-bold text-white">ДОСТАВКА</h1>
            </div>

            <div className="grid gap-4 mb-8">
              {[
                { icon: "Zap", title: "Экспресс-доставка", time: "1–2 дня", price: "399 ₽", desc: "Доставка на следующий день в крупные города России" },
                { icon: "Truck", title: "Стандартная доставка", time: "3–5 дней", price: "199 ₽", desc: "Доставка по всей России транспортными компаниями" },
                { icon: "Package", title: "Постамат или ПВЗ", time: "2–4 дня", price: "Бесплатно", desc: "Пункты выдачи в каждом городе, удобное время получения" },
                { icon: "Store", title: "Самовывоз", time: "Сегодня", price: "Бесплатно", desc: "Забирайте товар сразу после подтверждения заказа" },
              ].map((d, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    <Icon name={d.icon as IconName} size={24} className="neon-purple" />
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-white text-xl mb-1">{d.title}</div>
                    <div className="text-white/50 text-sm">{d.desc}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold text-xl neon-cyan">{d.price}</div>
                    <div className="text-white/50 text-sm">{d.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-bold text-white text-xl uppercase mb-4">Бесплатная доставка</h3>
              <p className="text-white/60 mb-4">При заказе от <span className="neon-cyan font-bold">5 000 ₽</span> доставка в постамат или ПВЗ полностью бесплатна.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["CDEK", "Яндекс.Доставка", "Почта России", "DPD"].map((s, i) => (
                  <div key={i} className="rounded-xl py-3 px-4 text-center text-white/70 text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {activePage === "reviews" && (
          <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <div className="tag-badge inline-block mb-3">Отзывы</div>
                <h1 className="font-display text-5xl font-bold text-white">ЧТО ГОВОРЯТ КЛИЕНТЫ</h1>
              </div>
              <div className="text-right hidden md:block">
                <div className="font-display text-5xl font-bold gradient-text">4.9</div>
                <div className="text-yellow-400 text-lg">★★★★★</div>
                <div className="text-white/50 text-sm">из 250 000 отзывов</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {REVIEWS.map((r, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center text-white font-bold font-display">
                      {r.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{r.name}</div>
                      <div className="text-white/40 text-xs">{r.date}</div>
                    </div>
                    <div className="ml-auto text-yellow-400 text-sm">{"★".repeat(r.rating)}</div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT */}
        {activePage === "about" && (
          <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-10">
              <div className="tag-badge inline-block mb-3">О нас</div>
              <h1 className="font-display text-5xl font-bold text-white">О МАГАЗИНЕ</h1>
            </div>

            <div className="glass-card rounded-3xl p-8 mb-6">
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                <span className="font-display text-2xl font-bold gradient-text">NOVASHOP</span> — это современный интернет-магазин электроники и гаджетов, работающий с 2020 года. Мы предлагаем только оригинальную продукцию от ведущих мировых производителей с официальной гарантией.
              </p>
              <p className="text-white/60 leading-relaxed">
                Наша миссия — сделать передовые технологии доступными каждому. Мы тщательно отбираем каждый товар, проверяем качество и предоставляем честные описания без приукрашиваний.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { val: "2020", label: "Год основания" },
                { val: "15 000+", label: "Товаров" },
                { val: "250К+", label: "Клиентов" },
                { val: "50+", label: "Брендов" },
              ].map((s, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 text-center">
                  <div className="font-display text-3xl font-bold gradient-text mb-1">{s.val}</div>
                  <div className="text-white/50 text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: "BadgeCheck", title: "Официальный импортёр", desc: "Все товары сертифицированы и имеют официальную гарантию производителя" },
                { icon: "Users", title: "Опытная команда", desc: "Более 100 специалистов помогают вам с выбором и поддержкой 24/7" },
                { icon: "Award", title: "Награды и признание", desc: "Лучший интернет-магазин электроники по версии Рунета 2024–2025" },
              ].map((b, i) => (
                <div key={i} className="glass-card rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    <Icon name={b.icon as IconName} size={20} className="neon-purple" />
                  </div>
                  <div className="font-display font-semibold text-white mb-2">{b.title}</div>
                  <div className="text-white/50 text-sm">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACTS */}
        {activePage === "contacts" && (
          <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-10">
              <div className="tag-badge inline-block mb-3">Связь</div>
              <h1 className="font-display text-5xl font-bold text-white">КОНТАКТЫ</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-8">
                <h3 className="font-display font-bold text-white text-xl uppercase mb-6">Напишите нам</h3>
                <div className="flex flex-col gap-4">
                  <input placeholder="Ваше имя" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors" />
                  <input placeholder="Email или телефон" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors" />
                  <textarea rows={4} placeholder="Ваше сообщение..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
                  <button className="gradient-btn text-white py-4 rounded-xl font-display font-bold uppercase tracking-wide">
                    Отправить сообщение
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { icon: "Phone", label: "Телефон", val: "+7 (800) 555-35-35", hint: "Бесплатный звонок" },
                  { icon: "Mail", label: "Email", val: "hello@novashop.ru", hint: "Ответим за 2 часа" },
                  { icon: "MapPin", label: "Адрес", val: "Москва, ул. Новая, 15", hint: "Пн–Вс: 9:00–21:00" },
                  { icon: "MessageCircle", label: "Telegram", val: "@novashop_support", hint: "Быстрые ответы 24/7" },
                ].map((c, i) => (
                  <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                      <Icon name={c.icon as IconName} size={22} className="neon-purple" />
                    </div>
                    <div>
                      <div className="text-white/50 text-xs uppercase tracking-wide">{c.label}</div>
                      <div className="font-semibold text-white">{c.val}</div>
                      <div className="text-white/40 text-xs">{c.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 glass" style={{ borderTop: '1px solid rgba(168,85,247,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-btn flex items-center justify-center text-white font-bold text-xs">N</div>
            <span className="font-display font-bold text-white">NOVA<span className="neon-purple">SHOP</span></span>
          </div>
          <div className="text-white/40 text-sm">© 2026 NOVASHOP. Все права защищены.</div>
          <div className="flex gap-4">
            {nav.slice(0, 4).map(n => (
              <button key={n.id} onClick={() => setActivePage(n.id)} className="text-white/40 hover:text-white/80 text-xs transition-colors">{n.label}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product: p, onAddToCart, delay }: { product: typeof PRODUCTS[0]; onAddToCart: (id: number) => void; delay: number }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(p.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const tagColors: Record<string, string> = {
    "Хит": "rgba(255,0,128,0.2)",
    "Скидка": "rgba(0,245,255,0.15)",
    "Новинка": "rgba(168,85,247,0.2)",
  };
  const tagTextColors: Record<string, string> = {
    "Хит": "#ff0080",
    "Скидка": "#00f5ff",
    "Новинка": "#a855f7",
  };

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col animate-fade-in" style={{ animationDelay: `${delay * 0.1}s`, opacity: 0 }}>
      <div className="relative mb-3">
        <div className="w-full aspect-square rounded-xl flex items-center justify-center text-5xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.1)' }}>
          {p.img}
        </div>
        {p.tag && (
          <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-lg" style={{ background: tagColors[p.tag], color: tagTextColors[p.tag], border: `1px solid ${tagTextColors[p.tag]}40` }}>
            {p.tag}
          </span>
        )}
      </div>

      <div className="font-semibold text-white text-sm mb-1 line-clamp-2 leading-tight">{p.name}</div>
      <div className="text-white/40 text-xs mb-3">{p.category}</div>

      <div className="flex items-center gap-1 mb-3">
        <span className="text-yellow-400 text-xs">★</span>
        <span className="text-white/70 text-xs">{p.rating}</span>
        <span className="text-white/30 text-xs">({p.reviews})</span>
      </div>

      <div className="mt-auto">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-display font-bold text-lg neon-cyan">{p.price.toLocaleString("ru")} ₽</span>
          {p.oldPrice && <span className="text-white/30 text-xs line-through">{p.oldPrice.toLocaleString("ru")} ₽</span>}
        </div>
        <button
          onClick={handleAdd}
          className={`w-full py-2.5 rounded-xl text-sm font-display font-semibold uppercase tracking-wide transition-all ${added ? 'text-green-400' : 'gradient-btn text-white'}`}
          style={added ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' } : {}}
        >
          {added ? "✓ Добавлено" : "В корзину"}
        </button>
      </div>
    </div>
  );
}