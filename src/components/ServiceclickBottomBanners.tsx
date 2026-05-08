import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function ServiceclickBottomBanners() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="grid grid-cols-2 gap-4">

        {/* Бизнес-баннер */}
        <div
          className="rounded-2xl p-7 flex items-center justify-between relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)", minHeight: 200 }}
          onClick={() => navigate("/catalog")}
        >
          {/* Текст */}
          <div className="relative z-10 flex flex-col gap-4 max-w-[55%]">
            <h3 className="text-white font-extrabold text-2xl leading-tight">
              Развивайте бизнес<br />вместе с нами
            </h3>
            <p className="text-white/60 text-sm leading-snug">
              Специальные цены, персональный менеджер и другие привилегии при регистрации
            </p>
            <div className="flex gap-3 mt-1">
              <button className="bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                Зарегистрировать
              </button>
              <button className="border border-white/40 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
                Узнать больше
              </button>
            </div>
          </div>

          {/* Иллюстрация */}
          <div className="relative z-10 flex items-center gap-3 opacity-90">
            <div className="flex flex-col items-center gap-1">
              <div className="w-20 h-14 bg-gradient-to-br from-[#f47d20] to-[#e65100] rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Laptop" size={32} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 mt-6">
              <div className="w-16 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                <Icon name="Briefcase" size={28} className="text-white/80" />
              </div>
            </div>
          </div>

          {/* Фоновый декор */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-[#0f3460] opacity-50" />
          <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-[#f47d20] opacity-10" />
        </div>

        {/* Конфигуратор ПК */}
        <div
          className="rounded-2xl p-7 flex items-center justify-between relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
          style={{ background: "linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)", minHeight: 200 }}
          onClick={() => navigate("/catalog?search=компьютер")}
        >
          {/* Текст */}
          <div className="relative z-10 flex flex-col gap-3 max-w-[55%]">
            <div className="flex items-center gap-2">
              <h3 className="text-gray-900 font-extrabold text-2xl leading-tight">
                Конфигуратор ПК
              </h3>
              <Icon name="Settings" size={24} className="text-[#f47d20]" />
            </div>
            <p className="text-gray-500 text-sm">Соберём компьютер под ваши задачи</p>
            <div className="flex items-center gap-2">
              <Icon name="ShieldCheck" size={16} className="text-green-600" />
              <span className="text-gray-700 font-semibold text-sm">Гарантия 3 года</span>
            </div>
            <button className="mt-2 bg-[#f47d20] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e06500] transition-colors flex items-center gap-2 w-fit">
              Собрать
              <Icon name="ArrowRight" size={16} className="text-white" />
            </button>
          </div>

          {/* Иллюстрация */}
          <div className="relative z-10 opacity-90">
            <div className="w-28 h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-xl border border-gray-700">
              <div className="flex flex-col items-center gap-1">
                <Icon name="Monitor" size={36} className="text-[#f47d20]" />
                <div className="flex gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-[#f47d20] animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: "0.6s" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Фоновый декор */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-[#f47d20] opacity-5" />
        </div>

      </div>
    </div>
  );
}
