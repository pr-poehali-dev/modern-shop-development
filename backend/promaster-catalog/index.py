import os
import json
import urllib.request
import urllib.error
import urllib.parse

BASE_URL = "https://pm-71723.promaster.app"
ALL_ITEMS_LIMIT = 500


def handler(event: dict, context) -> dict:
    """
    Прокси для ProMaster API — получение номенклатуры (каталога товаров).
    Фильтрация по группе выполняется на бэкенде, т.к. API не поддерживает filter.
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
    elif action == "explore_stock":
        data = explore_stock_endpoints(headers)
    else:
        page = int(params.get("page", 1))
        per_page = int(params.get("per_page", 24))
        category_id = params.get("category_id", "")
        search = params.get("search", "").strip().lower()
        data = fetch_products_filtered(headers, page, per_page, category_id, search)

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": json.dumps(data, ensure_ascii=False),
    }


def fetch_all_products(headers):
    """Загружает все товары постранично"""
    all_items = []
    page = 1
    while True:
        url = f"{BASE_URL}/api/v1/store/getNomenclatures?limit={ALL_ITEMS_LIMIT}&page={page}"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = json.loads(resp.read().decode())
        items = raw.get("items", [])
        all_items.extend(items)
        total_pages = raw.get("pages", 1)
        if page >= total_pages:
            break
        page += 1
    return all_items


def fetch_products_filtered(headers, page, per_page, category_id, search):
    try:
        all_items = fetch_all_products(headers)

        # Фильтруем по groupId
        if category_id:
            all_items = [p for p in all_items if str(p.get("groupId", "")) == str(category_id)]

        # Фильтруем по поиску
        if search:
            all_items = [p for p in all_items if search in p.get("name", "").lower()]

        total = len(all_items)

        # Пагинация
        offset = (page - 1) * per_page
        page_items = all_items[offset:offset + per_page]
        pages = max(1, (total + per_page - 1) // per_page)

        items = [normalize_product(p) for p in page_items]
        return {"items": items, "total": total, "pages": pages, "page_current": page}

    except Exception as e:
        print(f"[promaster] error: {e}")
        return {"error": str(e), "items": [], "total": 0}


def fetch_categories_from_products(headers):
    """Собирает уникальные группы прямо из товаров — так id совпадают с groupId"""
    try:
        all_items = fetch_all_products(headers)
        seen = {}
        for p in all_items:
            gid = p.get("groupId")
            gname = p.get("groupName", "")
            if gid and gid not in seen:
                seen[gid] = gname
        items = [{"id": gid, "name": gname, "parent_id": None, "count": 0} for gid, gname in sorted(seen.items(), key=lambda x: x[1])]
        # Проставляем count
        counts = {}
        for p in all_items:
            gid = p.get("groupId")
            if gid:
                counts[gid] = counts.get(gid, 0) + 1
        for item in items:
            item["count"] = counts.get(item["id"], 0)
        return {"items": items}
    except Exception as e:
        print(f"[promaster] categories error: {e}")
        return {"error": str(e), "items": []}


def explore_stock_endpoints(headers):
    """Разведка: смотрим склады и все поля первого товара"""
    results = {}
    # Склады
    url = f"{BASE_URL}/api/v1/store/getStores?limit=50"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            results["getStores"] = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        results["getStores"] = {"http_error": e.code, "body": e.read().decode()[:300]}
    except Exception as e:
        results["getStores"] = {"error": str(e)}
    # Все поля первого товара
    url = f"{BASE_URL}/api/v1/store/getNomenclatures?limit=1&page=1"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = json.loads(resp.read().decode())
            first_item = raw.get("items", [{}])[0]
            results["nomenclature_fields"] = first_item
    except Exception as e:
        results["nomenclature_fields"] = {"error": str(e)}
    return results


def normalize_product(p):
    price = p.get("price", 0)
    old_price = p.get("old_price", None)
    images = p.get("images", [])
    image = ""
    if images and isinstance(images, list):
        image = images[0].get("url", images[0]) if isinstance(images[0], dict) else images[0]
    if image and not str(image).startswith("http"):
        image = f"{BASE_URL}{image}"

    return {
        "id": p.get("id", ""),
        "name": p.get("name", ""),
        "price": float(price) if price else 0,
        "old_price": float(old_price) if old_price else None,
        "image": image,
        "category_id": p.get("groupId", ""),
        "category_name": p.get("groupName", ""),
        "sku": p.get("partNumber", p.get("barCode", "")),
        "unit": p.get("unit", ""),
        "description": p.get("description", ""),
        "in_stock": True,
    }