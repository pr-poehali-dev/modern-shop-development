import { useState, useEffect } from "react";

const ADMIN_API_URL = "https://functions.poehali.dev/58efb070-a53e-4380-88c5-6f0f16480430";

export interface ShopLocation {
  id: number;
  name: string;
  city: string;
  store_ids: number[];
}

const CACHE_TTL = 5 * 60_000; // 5 минут
const SS_STORES_KEY = "sc_visible_stores";
const SS_LOCATIONS_KEY = "sc_locations";

function ssGet<T>(key: string): { data: T; ts: number } | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function ssSet(key: string, data: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch (_) {
    // sessionStorage недоступен
  }
}

// Кэш для глобальных настроек складов
const _ssStores = ssGet<number[]>(SS_STORES_KEY);
const _ssLoc = ssGet<ShopLocation[]>(SS_LOCATIONS_KEY);
let globalCache: number[] | null = _ssStores && Date.now() - _ssStores.ts < CACHE_TTL ? _ssStores.data : null;
let globalCacheTime = globalCache ? Date.now() : 0;
let locationsCache: ShopLocation[] | null = _ssLoc && Date.now() - _ssLoc.ts < CACHE_TTL ? _ssLoc.data : null;
let locationsCacheTime = locationsCache ? Date.now() : 0;

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
        ssSet(SS_STORES_KEY, ids);
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
        ssSet(SS_LOCATIONS_KEY, items);
        setLocations(items);
      })
      .catch(() => {
        locationsCache = [];
        setLocations([]);
      });
  }, []);

  return locations;
}

/**
 * Итоговый список складов с учётом выбранной локации.
 * Реагирует на изменения через кастомное событие shop_location_changed.
 */
export function useLocationStores(): number[] | null {
  const globalStoreIds = useVisibleStores();
  const shopLocations = useShopLocations();

  const [locationId, setLocationId] = useState<number | null>(() => {
    const saved = localStorage.getItem("shop_location_id");
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    const onCustom = () => {
      const saved = localStorage.getItem("shop_location_id");
      setLocationId(saved ? Number(saved) : null);
    };
    window.addEventListener("shop_location_changed", onCustom);
    // cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === "shop_location_id") onCustom();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("shop_location_changed", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (shopLocations && shopLocations.length > 0 && locationId !== null) {
    const loc = shopLocations.find(l => l.id === locationId);
    if (loc) return loc.store_ids.length > 0 ? loc.store_ids : null;
  }
  return globalStoreIds;
}