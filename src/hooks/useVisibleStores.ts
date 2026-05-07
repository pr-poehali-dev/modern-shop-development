import { useState, useEffect } from "react";

const ADMIN_API_URL = "https://functions.poehali.dev/58efb070-a53e-4380-88c5-6f0f16480430";

export interface ShopLocation {
  id: number;
  name: string;
  city: string;
  store_ids: number[];
}

// Кэш для глобальных настроек складов
let globalCache: number[] | null = null;
let globalCacheTime = 0;
let locationsCache: ShopLocation[] | null = null;
let locationsCacheTime = 0;
const CACHE_TTL = 60_000;

export function useVisibleStores() {
  const [storeIds, setStoreIds] = useState<number[] | null>(globalCache);

  useEffect(() => {
    const now = Date.now();
    if (globalCache !== null && now - globalCacheTime < CACHE_TTL) {
      setStoreIds(globalCache);
      return;
    }
    fetch(`${ADMIN_API_URL}?action=shop_warehouses`)
      .then(r => r.json())
      .then(data => {
        const ids = data.store_ids || [];
        globalCache = ids;
        globalCacheTime = Date.now();
        setStoreIds(ids);
      })
      .catch(() => {
        globalCache = [];
        setStoreIds([]);
      });
  }, []);

  return storeIds; // null = загрузка, [] = нет фильтра, [1,2] = фильтр
}

export function useShopLocations() {
  const [locations, setLocations] = useState<ShopLocation[] | null>(locationsCache);

  useEffect(() => {
    const now = Date.now();
    if (locationsCache !== null && now - locationsCacheTime < CACHE_TTL) {
      setLocations(locationsCache);
      return;
    }
    fetch(`${ADMIN_API_URL}?action=locations_public`)
      .then(r => r.json())
      .then(data => {
        const items: ShopLocation[] = data.items || [];
        locationsCache = items;
        locationsCacheTime = Date.now();
        setLocations(items);
      })
      .catch(() => {
        locationsCache = [];
        setLocations([]);
      });
  }, []);

  return locations;
}
