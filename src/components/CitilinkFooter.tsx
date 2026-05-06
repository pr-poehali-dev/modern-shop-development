import Icon from "@/components/ui/icon";

const footerLinks = {
  "Покупателям": ["Доставка и оплата", "Гарантия и возврат", "Кредит и рассрочка", "Трейд-ин", "Корпоративным клиентам", "Программа лояльности"],
  "Компания": ["О компании", "Вакансии", "Контакты", "Реквизиты", "Пресс-центр", "Партнёрам"],
  "Сервис": ["Сервисный центр", "Настройка техники", "Подключение услуг", "Обслуживание на дому"],
  "Помощь": ["Часто задаваемые вопросы", "Обратная связь", "Пожаловаться", "Публичная оферта"],
};

export default function ServiceclickFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-6">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-5 gap-8">
          {/* Logo & contacts */}
          <div>
            <div className="text-2xl font-black italic mb-3">Serviceclick</div>
            <p className="text-gray-400 text-sm mb-3">Интернет-магазин электроники и бытовой техники</p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="tel:88005005555" className="text-white hover:text-[#e31e24] flex items-center gap-2">
                <Icon name="Phone" size={14} className="text-gray-400" />
                8 800 500-55-55
              </a>
              <span className="text-gray-500 text-xs ml-5">Бесплатно по России</span>
            </div>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-[#2d2d2d] hover:bg-[#e31e24] rounded flex items-center justify-center transition-colors">
                <Icon name="MessageCircle" size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-[#2d2d2d] hover:bg-[#e31e24] rounded flex items-center justify-center transition-colors">
                <Icon name="Youtube" size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-[#2d2d2d] hover:bg-[#e31e24] rounded flex items-center justify-center transition-colors">
                <Icon name="Instagram" size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-3">{title}</h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 text-xs hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-[#2d2d2d] mt-8 pt-6 flex items-center justify-between">
          <p className="text-gray-500 text-xs">© 2025 Serviceclick. Все права защищены.</p>
          <div className="flex gap-3">
            {["Visa", "MasterCard", "МИР", "SberPay"].map((p) => (
              <span key={p} className="bg-[#2d2d2d] text-gray-400 text-xs px-2 py-1 rounded">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}