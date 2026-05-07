import { useState, useEffect } from "react";

const ADMIN_API_URL = "https://functions.poehali.dev/58efb070-a53e-4380-88c5-6f0f16480430";

let cache: number[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 минута

export function useVisibleStores() {
  const [storeIds, setStoreIds] = useState<number[] | null>(cache);

  useEffect(() => {
    const now = Date.now();
    if (cache !== null && now - cacheTime < CACHE_TTL) {
      setStoreIds(cache);
      return;
    }
    fetch(`${ADMIN_API_URL}?action=shop_warehouses`)
      .then(r => r.json())
      .then(data => {
        const ids = data.store_ids || [];
        cache = ids;
        cacheTime = Date.now();
        setStoreIds(ids);
      })
      .catch(() => {
        cache = [];
        setStoreIds([]);
      });
  }, []);

  return storeIds; // null = ещё грузится, [] = все скрыты, [1,2] = фильтровать
}
