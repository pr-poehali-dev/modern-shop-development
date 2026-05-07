import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";

const API_URL = "https://functions.poehali.dev/ef02c3ce-d482-422a-9426-60d8f91b4b86";

export interface CartItem {
  id: number;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  product_sku: string;
  product_unit: string;
  quantity: number;
  store_id: number | null;
  store_name: string | null;
  max_quantity: number | null;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  cartStoreId: number | null;
  cartStoreName: string | null;
  addToCart: (product: {
    id: string | number;
    name: string;
    price: number;
    image: string;
    sku: string;
    unit: string;
    store_id?: number | null;
    store_name?: string | null;
    max_quantity?: number | null;
    stock_by_store?: Array<{ store_id: number; store_name: string; quantity: number }> | null;
  }) => Promise<{ ok: boolean; conflictStore?: string }>;
  updateQuantity: (product_id: string, quantity: number) => Promise<{ ok: boolean; error?: string }>;
  removeItem: (product_id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reload: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const call = useCallback(
    async (body: object) => {
      if (!token) return null;
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify(body),
      });
      return res.json();
    },
    [token]
  );

  const reload = useCallback(async () => {
    if (!token) { setItems([]); return; }
    setLoading(true);
    try {
      const data = await call({ action: "cart.get" });
      setItems(data?.items || []);
    } finally {
      setLoading(false);
    }
  }, [token, call]);

  useEffect(() => {
    reload();
  }, [user, reload]);

  const cartStoreId = items.length > 0 ? (items[0].store_id ?? null) : null;
  const cartStoreName = items.length > 0 ? (items[0].store_name ?? null) : null;

  const addToCart = async (product: {
    id: string | number; name: string; price: number;
    image: string; sku: string; unit: string;
    store_id?: number | null; store_name?: string | null;
    max_quantity?: number | null;
    stock_by_store?: Array<{ store_id: number; store_name: string; quantity: number }> | null;
  }): Promise<{ ok: boolean; conflictStore?: string }> => {
    const incomingStoreId = product.store_id ?? null;

    if (items.length > 0 && cartStoreId !== null && incomingStoreId !== null && cartStoreId !== incomingStoreId) {
      return { ok: false, conflictStore: cartStoreName || `Склад #${cartStoreId}` };
    }

    const data = await call({
      action: "cart.add",
      product_id: String(product.id),
      product_name: product.name,
      product_price: product.price,
      product_image: product.image || "",
      product_sku: product.sku || "",
      product_unit: product.unit || "шт",
      store_id: incomingStoreId,
      store_name: product.store_name || null,
      max_quantity: product.max_quantity ?? null,
      stock_by_store: product.stock_by_store ?? null,
    });
    if (data?.item) {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.product_id === data.item.product_id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data.item;
          return next;
        }
        return [...prev, data.item];
      });
    }
    return { ok: true };
  };

  const updateQuantity = async (product_id: string, quantity: number): Promise<{ ok: boolean; error?: string }> => {
    // Клиентская проверка до запроса на бэкенд
    if (quantity > 0) {
      const item = items.find(i => i.product_id === product_id);
      if (item?.max_quantity !== null && item?.max_quantity !== undefined && quantity > item.max_quantity) {
        return { ok: false, error: `Доступно только ${item.max_quantity} шт.` };
      }
    }

    const data = await call({ action: "cart.update", product_id, quantity });

    if (data?.error) {
      return { ok: false, error: data.error };
    }

    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== product_id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product_id === product_id ? { ...i, quantity } : i))
      );
    }
    return { ok: true };
  };

  const removeItem = async (product_id: string) => {
    await call({ action: "cart.remove", product_id });
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  };

  const clearCart = async () => {
    await call({ action: "cart.clear" });
    setItems([]);
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.product_price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, loading, cartStoreId, cartStoreName, addToCart, updateQuantity, removeItem, clearCart, reload }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}