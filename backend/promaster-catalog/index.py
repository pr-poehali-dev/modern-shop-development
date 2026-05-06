import os
import json
import urllib.request
import urllib.error
import urllib.parse

BASE_URL = "https://pm-71723.promaster.app"
ALL_ITEMS_LIMIT = 500


def handler(event: dict, context) -> dict:
    """
    Прокси для ProMaster API — каталог товаров с остатками по складам.
    Фильтрация по группе выполняется на бэкенде, т.к. API игнорирует filter.
    action=products — список товаров с остатками
    action=categories — группы из товаров
    action=stores — список складов
    """
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    token = os.environ.get("PROMASTER_API_TOKEN", "")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "products")

    headers = {
        "Content-Type": "application/json",
        "Authorization": token,
    }

    if action == "categories":
        data = fetch_categories_from_products(headers)
    elif action == "debug_raw":
        # Временный action — ищем группы по имени
        search_name = params.get("search", "").lower()
        all_items = fetch_all_pages(f"{BASE_URL}/api/v1/store/getNomenclatures?limit={ALL_ITEMS_LIMIT}", headers)
        seen = {}
        for p in all_items:
            gid = p.get("groupId")
            gname = p.get("groupName", "")
            if gid not in seen:
                seen[gid] = gname
        if search_name:
            result = [{"id": gid, "name": gname} for gid, gname in seen.items() if search_name in gname.lower()]
        else:
            result = [{"id": gid, "name": gname} for gid, gname in sorted(seen.items(), key=lambda x: x[1])]
        data = {"groups": result, "total": len(result)}
    elif action == "stores":
        data = fetch_stores(headers)
    else:
        page = int(params.get("page", 1))
        per_page = int(params.get("per_page", 24))
        category_id = params.get("category_id", "")
        search = params.get("search", "").strip().lower()
        store_id = params.get("store_id", "")
        price_min = params.get("price_min", "")
        price_max = params.get("price_max", "")
        in_stock = params.get("in_stock", "")
        sort = params.get("sort", "")
        sku_search = params.get("sku_search", "").strip()
        data = fetch_products_filtered(headers, page, per_page, category_id, search, store_id, price_min, price_max, in_stock, sort, sku_search)

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": json.dumps(data, ensure_ascii=False),
    }


def fetch_url(url, headers):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def fetch_all_pages(url_base, headers):
    """Загружает все страницы постранично"""
    all_items = []
    page = 1
    while True:
        raw = fetch_url(f"{url_base}&page={page}", headers)
        items = raw.get("items", [])
        all_items.extend(items)
        if page >= raw.get("pages", 1):
            break
        page += 1
    return all_items


def fetch_stores(headers):
    """Список складов"""
    try:
        raw = fetch_url(f"{BASE_URL}/api/v1/store/getStores?limit=100", headers)
        items = [
            {"id": s.get("id"), "name": s.get("name", ""), "main": s.get("main", False)}
            for s in raw.get("items", [])
        ]
        return {"items": items}
    except Exception as e:
        return {"error": str(e), "items": []}


def fetch_store_stock(headers, store_id):
    """Остатки по конкретному складу — возвращает dict {nomenclatureId: quantity}"""
    try:
        url_base = f"{BASE_URL}/api/v1/store/getStoreNomenclatures?limit={ALL_ITEMS_LIMIT}&filter[storeId]={store_id}"
        all_items = fetch_all_pages(url_base, headers)
        # Логируем первый элемент для отладки
        stock = {}
        for item in all_items:
            nid = item.get("id")
            qty = item.get("stock", 0)
            if nid is not None:
                stock[str(nid)] = qty
        return stock
    except Exception as e:
        print(f"[stock] store_id={store_id} error: {e}")
        return {}


def fetch_all_stores_stock(headers, stores):
    """Остатки по всем складам — {store_id: {nomenclatureId: qty}}"""
    all_stock = {}
    for store in stores:
        sid = store["id"]
        all_stock[sid] = fetch_store_stock(headers, sid)
    return all_stock


def fetch_products_filtered(headers, page, per_page, category_id, search, store_id, price_min="", price_max="", in_stock="", sort="", sku_search=""):
    try:
        all_items = fetch_all_pages(
            f"{BASE_URL}/api/v1/store/getNomenclatures?limit={ALL_ITEMS_LIMIT}", headers
        )

        stores_raw = fetch_url(f"{BASE_URL}/api/v1/store/getStores?limit=100", headers)
        stores = [
            {"id": s.get("id"), "name": s.get("name", ""), "main": s.get("main", False)}
            for s in stores_raw.get("items", [])
        ]

        all_stock = fetch_all_stores_stock(headers, stores)

        # Нормализуем все товары сразу для фильтрации по цене и наличию
        normalized = [normalize_product(p, stores, all_stock) for p in all_items]

        # Фильтр по категории
        if category_id:
            normalized = [p for p in normalized if str(p.get("category_id", "")) == str(category_id)]

        # Фильтр по поиску (имя)
        if search:
            normalized = [p for p in normalized if search in p.get("name", "").lower()]

        # Фильтр по артикулу
        if sku_search:
            normalized = [p for p in normalized if sku_search.lower() in (p.get("sku") or "").lower()]

        # Фильтр по складу
        if store_id:
            normalized = [p for p in normalized if any(
                s["store_id"] == int(store_id) and s["quantity"] > 0
                for s in p.get("stock_by_store", [])
            )]

        # Фильтр только в наличии
        if in_stock == "1":
            normalized = [p for p in normalized if p.get("in_stock")]

        # Фильтр по цене
        if price_min:
            try:
                pmin = float(price_min)
                normalized = [p for p in normalized if p.get("price", 0) >= pmin]
            except ValueError:
                pass
        if price_max:
            try:
                pmax = float(price_max)
                normalized = [p for p in normalized if 0 < p.get("price", 0) <= pmax]
            except ValueError:
                pass

        # Сортировка
        if sort == "price_asc":
            normalized = sorted(normalized, key=lambda p: p.get("price", 0))
        elif sort == "price_desc":
            normalized = sorted(normalized, key=lambda p: p.get("price", 0), reverse=True)
        elif sort == "name_asc":
            normalized = sorted(normalized, key=lambda p: p.get("name", ""))
        elif sort == "name_desc":
            normalized = sorted(normalized, key=lambda p: p.get("name", ""), reverse=True)

        # Диапазон цен для фронтенда
        prices = [p["price"] for p in normalized if p.get("price", 0) > 0]
        price_range = {"min": int(min(prices)) if prices else 0, "max": int(max(prices)) if prices else 0}

        total = len(normalized)
        offset = (page - 1) * per_page
        page_items = normalized[offset:offset + per_page]
        pages = max(1, (total + per_page - 1) // per_page)

        return {"items": page_items, "total": total, "pages": pages, "page_current": page, "stores": stores, "price_range": price_range}

    except Exception as e:
        print(f"[promaster] error: {e}")
        return {"error": str(e), "items": [], "total": 0}


def fetch_categories_from_products(headers):
    """Собирает уникальные группы из товаров — id гарантированно совпадают с groupId"""
    try:
        all_items = fetch_all_pages(
            f"{BASE_URL}/api/v1/store/getNomenclatures?limit={ALL_ITEMS_LIMIT}", headers
        )
        seen = {}
        counts = {}
        for p in all_items:
            gid = p.get("groupId")
            gname = p.get("groupName", "")
            parent_gid = p.get("parentGroupId") or p.get("parentId") or None
            if gid and gid not in seen:
                seen[gid] = {"name": gname, "parent_id": parent_gid}
            if gid:
                counts[gid] = counts.get(gid, 0) + 1
        # Логируем первый элемент для отладки иерархии
        if all_items:
            first = all_items[0]
            print(f"[debug] product keys: {list(first.keys())}")
            print(f"[debug] group fields: groupId={first.get('groupId')}, groupName={first.get('groupName')}, parentGroupId={first.get('parentGroupId')}, parentId={first.get('parentId')}")
        items = [
            {"id": gid, "name": info["name"], "parent_id": info["parent_id"], "count": counts.get(gid, 0)}
            for gid, info in sorted(seen.items(), key=lambda x: x[1]["name"])
        ]
        return {"items": items}
    except Exception as e:
        print(f"[categories] error: {e}")
        return {"error": str(e), "items": []}


def normalize_product(p, stores, all_stock):
    images = p.get("images", [])
    image = ""
    if images and isinstance(images, list):
        first = images[0]
        image = first.get("url", first) if isinstance(first, dict) else first
    if image and not str(image).startswith("http"):
        image = f"{BASE_URL}{image}"

    pid = str(p.get("id", ""))

    # Остатки по каждому складу
    stock_by_store = []
    total_qty = 0
    for store in stores:
        sid = store["id"]
        qty = all_stock.get(sid, {}).get(pid, 0)
        total_qty += qty
        stock_by_store.append({
            "store_id": sid,
            "store_name": store["name"],
            "quantity": qty,
        })

    sku = p.get("partNumber") or p.get("barCode") or ""
    return {
        "id": p.get("id", ""),
        "name": p.get("name", ""),
        "price": float(p.get("price", 0) or 0),
        "old_price": float(p.get("old_price")) if p.get("old_price") else None,
        "image": image,
        "category_id": p.get("groupId", ""),
        "category_name": p.get("groupName", ""),
        "sku": sku,
        "unit": p.get("unit", ""),
        "description": p.get("description", ""),
        "in_stock": total_qty > 0,
        "stock_by_store": stock_by_store,
    }