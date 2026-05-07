import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickFooter from "@/components/ServiceclickFooter";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const API_URL = "https://functions.poehali.dev/ef02c3ce-d482-422a-9426-60d8f91b4b86";
const MIN_DELIVERY = 1000;

export default function CheckoutPage() {
  const { user, token } = useAuth();
  const { items, total, count } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    let result = "+7";
    if (digits.length > 1) result += " (" + digits.slice(1, 4);
    if (digits.length >= 4) result += ") " + digits.slice(4, 7);
    if (digits.length >= 7) result += "-" + digits.slice(7, 9);
    if (digits.length >= 9) result += "-" + digits.slice(9, 11);
    return result;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const normalized = raw.startsWith("8") ? "7" + raw.slice(1) : raw.startsWith("7") ? raw : "7" + raw;
    setPhone(formatPhone(normalized));
  };

  if (!user) {
    navigate("/login", { state: { from: "/checkout" } });
    return null;
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const deliveryFree = total >= MIN_DELIVERY;
  const canDelivery = deliveryFree;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Введите имя"); return; }
    if (phone.replace(/\D/g, "").length < 11) { setError("Введите корректный номер телефона"); return; }
    if (delivery === "delivery" && !address.trim()) { setError("Введите адрес доставки"); return; }
    if (delivery === "delivery" && !canDelivery) { setError(`Минимальная сумма для доставки — ${MIN_DELIVERY.toLocaleString("ru")} ₽`); return; }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token! },
        body: JSON.stringify({
          action: "order.create",
          customer_name: name.trim(),
          customer_phone: phone,
          delivery_type: delivery,
          address: address.trim(),
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      navigate(`/order-success?order=${data.order_number}&total=${data.total_price}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <ServiceclickHeader />
      <ServiceclickNav />

      <main className="flex-1">
        <div className="max-w-[900px] mx-auto px-4 py-6">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            <a href="/" className="hover:text-[#e31e24]">Главная</a>
            <Icon name="ChevronRight" size={14} />
            <a href="/cart" className="hover:text-[#e31e24]">Корзина</a>
            <Icon name="ChevronRight" size={14} />
            <span className="text-gray-800 font-medium">Оформление заказа</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Оформление заказа</h1>

          <form onSubmit={handleSubmit} className="flex gap-6 flex-col lg:flex-row">
            {/* Form */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Contact */}
              <div className="bg-white rounded-2xl p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="User" size={18} className="text-[#e31e24]" />
                  Контактные данные
                </h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Имя *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Иван Иванов"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e31e24] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Телефон *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+7 (___) ___-__-__"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e31e24] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-2xl p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="Truck" size={18} className="text-[#e31e24]" />
                  Способ доставки
                </h2>
                <div className="flex flex-col gap-3">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${delivery === "pickup" ? "border-[#e31e24] bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="delivery" value="pickup" checked={delivery === "pickup"} onChange={() => setDelivery("pickup")} className="mt-0.5 accent-[#e31e24]" />
                    <div>
                      <p className="font-medium text-gray-900">Самовывоз</p>
                      <p className="text-sm text-gray-500 mt-0.5">Бесплатно · Заберите из нашего магазина</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    !canDelivery ? "opacity-50 cursor-not-allowed border-gray-200" :
                    delivery === "delivery" ? "border-[#e31e24] bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input
                      type="radio" name="delivery" value="delivery"
                      checked={delivery === "delivery"}
                      disabled={!canDelivery}
                      onChange={() => canDelivery && setDelivery("delivery")}
                      className="mt-0.5 accent-[#e31e24]"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Курьерская доставка</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {canDelivery ? "Бесплатно" : `Доступна от ${MIN_DELIVERY.toLocaleString("ru")} ₽`}
                      </p>
                    </div>
                  </label>
                </div>

                {delivery === "delivery" && (
                  <div className="mt-3">
                    <label className="text-sm text-gray-600 mb-1 block">Адрес доставки *</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Город, улица, дом, квартира"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e31e24] transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Comment */}
              <div className="bg-white rounded-2xl p-5">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="MessageSquare" size={18} className="text-[#e31e24]" />
                  Комментарий к заказу
                </h2>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Необязательно"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e31e24] transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <Icon name="AlertCircle" size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl p-5 sticky top-4">
                <h2 className="font-bold text-gray-900 mb-4">Ваш заказ</h2>
                <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm gap-2">
                      <span className="text-gray-600 line-clamp-2 flex-1">{item.product_name}</span>
                      <span className="font-medium text-gray-900 flex-shrink-0">
                        {(item.product_price * item.quantity).toLocaleString("ru")} ₽
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 mb-3">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Товары ({count} шт)</span>
                    <span>{total.toLocaleString("ru")} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Доставка</span>
                    <span className="text-green-600">{delivery === "delivery" && canDelivery ? "Бесплатно" : delivery === "pickup" ? "Самовывоз" : `от ${MIN_DELIVERY.toLocaleString("ru")} ₽`}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 mb-4">
                  <span>Итого</span>
                  <span>{total.toLocaleString("ru")} ₽</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#e31e24] hover:bg-[#c41920] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? "Оформляю..." : "Подтвердить заказ"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <ServiceclickFooter />
    </div>
  );
}
