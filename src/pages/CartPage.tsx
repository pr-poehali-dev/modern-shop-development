import { useState, useEffect } from "react";
import ServiceclickHeader from "@/components/ServiceclickHeader";
import ServiceclickNav from "@/components/ServiceclickNav";
import ServiceclickFooter from "@/components/ServiceclickFooter";
import Icon from "@/components/ui/icon";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const CATALOG_API_URL = "https://functions.poehali.dev/15c8aecd-d37b-4aed-abce-dc0748135610";

interface StockCheck {
  product_id: string;
  store_id: number;
  requested: number;
  available: number;
  ok: boolean;
}

export default function CartPage() {
  const { user } = useAuth();
  const { items, count, total, loading, updateQuantity, removeItem, clearCart, cartStoreName } = useCart();
  const navigate = useNavigate();
  const [qtyErrors, setQtyErrors] = useState<Record<string, string>>({});
  const [stockChecks, setStockChecks] = useState<StockCheck[]>([]);
  const [checkingStock, setCheckingStock] = useState(false);
  const [stockChecked, setStockChecked] = useState(false);

  // Проверка наличия при открытии корзины
  useEffect(() => {
    if (loading || items.length === 0) return;
    const checkableItems = items.filter(i => i.store_id !== null);
    if (checkableItems.length === 0) return;
    setCheckingStock(true);
    fetch(`${CATALOG_API_URL}?action=stock_check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: checkableItems.map(i => ({
          product_id: i.product_id,
          store_id: i.store_id,
          quantity: i.quantity,
        })),
      }),
    })
      .then(r => r.json())
      .then(d => {
        setStockChecks(d.items || []);
        setStockChecked(true);
      })
      .catch(() => setStockChecked(true))
      .finally(() => setCheckingStock(false));
  }, [loading]);

  const getStockCheck = (product_id: string) =>
    stockChecks.find(s => String(s.product_id) === String(product_id));

  const hasStockIssues = stockChecks.some(s => !s.ok);
  const canCheckout = stockChecked && !hasStockIssues && items.length > 0;

  const handleQtyChange = async (product_id: string, newQty: number) => {
    const result = await updateQuantity(product_id, newQty);
    if (!result.ok && result.error) {
      setQtyErrors(prev => ({ ...prev, [product_id]: result.error! }));
      setTimeout(() => setQtyErrors(prev => { const next = { ...prev }; delete next[product_id]; return next; }), 3000);
    } else {
      setQtyErrors(prev => { const next = { ...prev }; delete next[product_id]; return next; });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
        <ServiceclickHeader />
        <ServiceclickNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-4 p-8">
            <Icon name="ShoppingCart" size={48} className="text-gray-300" />
            <p className="text-gray-500">Войдите, чтобы увидеть корзину</p>
            <button
              onClick={() => navigate("/login", { state: { from: "/cart" } })}
              className="bg-[#e31e24] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#c41920] transition-colors"
            >
              Войти
            </button>
          </div>
        </main>
        <ServiceclickFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <ServiceclickHeader />
      <ServiceclickNav />

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            <a href="/" className="hover:text-[#e31e24]">Главная</a>
            <Icon name="ChevronRight" size={14} />
            <span className="text-gray-800 font-medium">Корзина</span>
          </div>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              Корзина {count > 0 && <span className="text-gray-400 font-normal text-lg">({count} {count === 1 ? "товар" : count < 5 ? "товара" : "товаров"})</span>}
            </h1>
            {cartStoreName && (
              <span className="flex items-center gap-1.5 text-sm bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full">
                <Icon name="Warehouse" size={13} />
                {cartStoreName}
              </span>
            )}
          </div>

          {cartStoreName && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-sm text-blue-700">
              <Icon name="Info" size={15} className="flex-shrink-0" />
              Все товары заказываются со склада <b className="mx-1">{cartStoreName}</b>. Чтобы добавить товар с другого склада — очистите корзину.
            </div>
          )}

          {checkingStock && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4 text-sm text-gray-500">
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#e31e24] animate-spin flex-shrink-0" />
              Проверяем наличие товаров на складе...
            </div>
          )}

          {stockChecked && hasStockIssues && (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4 text-sm text-orange-700">
              <Icon name="AlertTriangle" size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <b>Есть расхождения в наличии.</b> Некоторые товары недоступны в запрошенном количестве. Скорректируйте количество или удалите товары, чтобы оформить заказ.
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-red-100 border-t-[#e31e24] animate-spin" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
              <Icon name="ShoppingCart" size={48} className="text-gray-300" />
              <p className="text-gray-500 text-lg">Корзина пуста</p>
              <a href="/catalog" className="bg-[#e31e24] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#c41920] transition-colors">
                Перейти в каталог
              </a>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="flex gap-6 flex-col lg:flex-row">
              {/* Items */}
              <div className="flex-1 flex flex-col gap-3">
                {items.map((item) => {
                  const atMax = item.max_quantity !== null && item.quantity >= item.max_quantity;
                  const qtyError = qtyErrors[item.product_id];
                  const sc = getStockCheck(item.product_id);
                  const stockIssue = sc && !sc.ok;

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-4 flex gap-4 items-center transition-all ${stockIssue ? "border-2 border-orange-300" : "border border-transparent"}`}
                    >
                      <a href={`/product/${item.product_id}`} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-[#f8f8f8]">
                        <img
                          src={item.product_image || `https://picsum.photos/seed/${item.product_id}/80/80`}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.product_id}/80/80`; }}
                        />
                      </a>
                      <div className="flex-1 min-w-0">
                        <a href={`/product/${item.product_id}`} className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-[#e31e24] transition-colors">
                          {item.product_name}
                        </a>
                        {item.product_sku && (
                          <p className="text-xs text-gray-400 mt-0.5">Арт. {item.product_sku}</p>
                        )}
                        {item.store_name && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Icon name="Warehouse" size={11} />
                            {item.store_name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-base font-bold text-gray-900">
                            {(item.product_price * item.quantity).toLocaleString("ru")} ₽
                          </p>
                          {item.max_quantity !== null && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${atMax ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                              {atMax ? `Максимум ${item.max_quantity} шт.` : `Доступно: ${item.max_quantity} шт.`}
                            </span>
                          )}
                        </div>
                        {stockIssue && (
                          <p className="text-xs text-orange-600 mt-1 flex items-center gap-1 font-medium">
                            <Icon name="AlertTriangle" size={11} />
                            В наличии: {sc!.available} шт., запрошено: {sc!.requested} шт.
                          </p>
                        )}
                        {qtyError && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <Icon name="AlertCircle" size={11} />
                            {qtyError}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleQtyChange(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#e31e24] hover:text-[#e31e24] transition-colors"
                        >
                          <Icon name="Minus" size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQtyChange(item.product_id, item.quantity + 1)}
                          disabled={atMax}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                            atMax
                              ? "border-gray-100 text-gray-300 cursor-not-allowed"
                              : "border-gray-200 hover:border-[#e31e24] hover:text-[#e31e24]"
                          }`}
                        >
                          <Icon name="Plus" size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Icon name="X" size={18} />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => clearCart()}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors self-start mt-1"
                >
                  Очистить корзину
                </button>
              </div>

              {/* Summary */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-white rounded-2xl p-5 sticky top-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Итого</h2>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Товары ({count} шт)</span>
                    <span>{total.toLocaleString("ru")} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>Доставка</span>
                    <span className="text-green-600">Бесплатно от 1 000 ₽</span>
                  </div>
                  {cartStoreName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
                      <Icon name="Warehouse" size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500">Склад:</span>
                      <span className="font-medium text-gray-800 truncate">{cartStoreName}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Сумма</span>
                      <span>{total.toLocaleString("ru")} ₽</span>
                    </div>
                  </div>

                  {checkingStock ? (
                    <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 text-sm text-center flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
                      Проверяем наличие...
                    </div>
                  ) : hasStockIssues ? (
                    <div className="w-full py-3 rounded-xl bg-orange-100 text-orange-700 text-sm text-center font-medium">
                      <Icon name="AlertTriangle" size={14} className="inline mr-1" />
                      Скорректируйте количество
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate("/checkout")}
                      className="w-full bg-[#e31e24] hover:bg-[#c41920] text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      Оформить заказ
                    </button>
                  )}

                  <a href="/catalog" className="block text-center text-sm text-gray-400 hover:text-[#e31e24] mt-3 transition-colors">
                    Продолжить покупки
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <ServiceclickFooter />
    </div>
  );
}
