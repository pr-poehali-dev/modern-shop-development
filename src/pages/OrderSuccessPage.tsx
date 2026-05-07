import { useSearchParams } from "react-router-dom";
import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickFooter from "@/components/ServiceclickFooter";
import Icon from "@/components/ui/icon";

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order") || "";
  const total = params.get("total") || "";

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <ServiceclickHeader />
      <ServiceclickNav />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={44} className="text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Заказ оформлен!</h1>
          <p className="text-gray-500 mb-6">Мы свяжемся с вами в ближайшее время для подтверждения</p>

          {orderNumber && (
            <div className="bg-[#f8f8f8] rounded-xl px-5 py-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Номер заказа</p>
              <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
              {total && (
                <p className="text-sm text-gray-500 mt-1">
                  Сумма: <span className="font-semibold text-gray-800">{Number(total).toLocaleString("ru")} ₽</span>
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <a
              href="/catalog"
              className="w-full bg-[#e31e24] hover:bg-[#c41920] text-white font-semibold py-3 rounded-xl transition-colors block"
            >
              Продолжить покупки
            </a>
            <a
              href="/"
              className="w-full border border-gray-200 hover:border-gray-300 text-gray-600 font-medium py-3 rounded-xl transition-colors block"
            >
              На главную
            </a>
          </div>
        </div>
      </main>

      <ServiceclickFooter />
    </div>
  );
}
