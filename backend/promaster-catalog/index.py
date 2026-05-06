import os
import json
import urllib.request
import urllib.error
import urllib.parse

BASE_URL = "https://pm-71723.promaster.app"


def handler(event: dict, context) -> dict:
    """
    Прокси для ProMaster API — получение номенклатуры (каталога товаров).
    Поддерживает фильтрацию по категории, поиск, пагинацию.
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

    print(f"[promaster] token present: {bool(token)}, action: {action}")

    if action == "categories":
        data = fetch_categories(headers)
    else:
        page = int(params.get("page", 1))
        per_page = int(params.get("per_page", 24))
        category_id = params.get("category_id", "")
        search = params.get("search", "")
        data = fetch_products(headers, page, per_page, category_id, search)

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": json.dumps(data, ensure_ascii=False),
    }


def fetch_url(url, headers):
    print(f"[promaster] fetching: {url}")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = resp.read().decode()
        print(f"[promaster] response (200): {body[:500]}")
        return json.loads(body)


def fetch_products(headers, page, per_page, category_id, search):
    url = f"{BASE_URL}/api/v1/store/getNomenclatures?limit={per_page}&page={page}"
    if category_id:
        url += f"&filter[category_id]={category_id}"
    if search:
        url += f"&filter[name]={urllib.parse.quote(search)}"

    try:
        raw = fetch_url(url, headers)
        print(f"[promaster] raw keys: {list(raw.keys()) if isinstance(raw, dict) else type(raw)}")
        return normalize_products(raw)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"[promaster] HTTP error {e.code}: {body[:300]}")
        return {"error": f"HTTP {e.code}", "detail": body, "items": [], "total": 0}
    except Exception as e:
        print(f"[promaster] error: {e}")
        return {"error": str(e), "items": [], "total": 0}


def fetch_categories(headers):
    url = f"{BASE_URL}/api/v1/store/getCategories"
    try:
        raw = fetch_url(url, headers)
        print(f"[promaster] categories raw keys: {list(raw.keys()) if isinstance(raw, dict) else type(raw)}")
        return normalize_categories(raw)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"[promaster] categories HTTP error {e.code}: {body[:300]}")
        return {"error": f"HTTP {e.code}", "detail": body, "items": []}
    except Exception as e:
        print(f"[promaster] categories error: {e}")
        return {"error": str(e), "items": []}


def normalize_products(raw):
    """Нормализует ответ ProMaster к единому формату"""
    if isinstance(raw, dict):
        items_raw = raw.get("items", raw.get("data", raw.get("nomenclatures", [])))
        total = raw.get("count", raw.get("total", len(items_raw)))
        pages = raw.get("pages", 1)
        page_current = raw.get("pageCurrent", 1)
    elif isinstance(raw, list):
        items_raw = raw
        total = len(raw)
        pages = 1
        page_current = 1
    else:
        return {"items": [], "total": 0, "raw": str(raw)}

    items = []
    for p in items_raw:
        price = p.get("price", p.get("sell_price", p.get("retail_price", 0)))
        old_price = p.get("old_price", p.get("price_before", None))
        image = p.get("image", p.get("photo", p.get("img", "")))
        if isinstance(image, list) and len(image) > 0:
            image = image[0]
        if image and not image.startswith("http"):
            image = f"{BASE_URL}{image}"

        items.append({
            "id": p.get("id", p.get("nomenklatura_id", "")),
            "name": p.get("name", p.get("title", p.get("nomenklatura_name", ""))),
            "price": float(price) if price else 0,
            "old_price": float(old_price) if old_price else None,
            "image": image,
            "category_id": p.get("category_id", p.get("group_id", "")),
            "category_name": p.get("category_name", p.get("group_name", "")),
            "sku": p.get("sku", p.get("article", p.get("code", ""))),
            "unit": p.get("unit", p.get("ed_izm", "")),
            "description": p.get("description", p.get("descr", "")),
            "in_stock": p.get("in_stock", p.get("quantity", 1)) not in [0, "0", False],
        })

    return {"items": items, "total": total, "pages": pages, "page_current": page_current}


def normalize_categories(raw):
    if isinstance(raw, dict):
        items_raw = raw.get("items", raw.get("data", raw.get("categories", [])))
    elif isinstance(raw, list):
        items_raw = raw
    else:
        return {"items": [], "raw": str(raw)}

    items = []
    for c in items_raw:
        items.append({
            "id": c.get("id", c.get("category_id", "")),
            "name": c.get("name", c.get("title", c.get("category_name", ""))),
            "parent_id": c.get("parent_id", None),
            "count": c.get("count", c.get("products_count", 0)),
        })

    return {"items": items}
