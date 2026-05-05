import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function CitilinkHeader() {
  const [cartCount] = useState(3);
  const [query, setQuery] = useState("");

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
          <div className="flex gap-4">
            <a href="#" className="hover:underline opacity-90">Москва</a>
            <a href="#" className="hover:underline opacity-90">Войти</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <a href="/" className="flex-shrink-0">
          <div className="text-white font-bold text-2xl tracking-tight">
            <span className="text-white text-3xl font-black italic">Ситилинк</span>
          </div>
        </a>

        {/* Catalog button */}
        <button className="flex items-center gap-2 bg-white text-[#e31e24] font-semibold px-4 py-2 rounded text-sm flex-shrink-0 hover:bg-gray-100 transition-colors">
          <Icon name="LayoutGrid" size={16} />
          Каталог
        </button>

        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск по сайту"
            className="w-full h-10 pl-4 pr-12 rounded text-gray-900 text-sm outline-none border-0"
          />
          <button className="absolute right-0 top-0 h-10 w-10 bg-[#c41920] rounded-r flex items-center justify-center hover:bg-[#a51217] transition-colors">
            <Icon name="Search" size={18} className="text-white" />
          </button>
        </div>

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
          <button className="flex flex-col items-center gap-0.5 px-3 py-1 hover:bg-[#c41920] rounded transition-colors text-white">
            <Icon name="User" size={20} />
            <span className="text-xs">Войти</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-3 py-1 hover:bg-[#c41920] rounded transition-colors text-white relative">
            <div className="relative">
              <Icon name="ShoppingCart" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#e31e24] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs">Корзина</span>
          </button>
        </div>
      </div>
    </header>
  );
}
