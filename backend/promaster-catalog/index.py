import os
import json
import urllib.request
import urllib.error

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
        "Authorization": f"Bearer {token}",
    }

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


def fetch_products(headers, page, per_page, category_id, search):
    offset = (page - 1) * per_page
    url = f"{BASE_URL}/api/v1/store/getNomenclatures?limit={per_page}&offset={offset}"
    if category_id:
        url += f"&category_id={category_id}"
    if search:
        url += f"&search={urllib.parse.quote(search)}"

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = json.loads(resp.read().decode())
            return normalize_products(raw)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return {"error": f"HTTP {e.code}", "detail": body, "items": [], "total": 0}
    except Exception as e:
        return {"error": str(e), "items": [], "total": 0}


def fetch_categories(headers):
    url = f"{BASE_URL}/api/v1/store/getCategories"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = json.loads(resp.read().decode())
            return normalize_categories(raw)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return {"error": f"HTTP {e.code}", "detail": body, "items": []}
    except Exception as e:
        return {"error": str(e), "items": []}


def normalize_products(raw):
    """Нормализует ответ ProMaster к единому формату"""
    if isinstance(raw, dict):
        items_raw = raw.get("data", raw.get("items", raw.get("nomenclatures", [])))
        total = raw.get("total", raw.get("count", len(items_raw)))
    elif isinstance(raw, list):
        items_raw = raw
        total = len(raw)
    else:
        return {"items": [], "total": 0, "raw": raw}

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

    return {"items": items, "total": total}


def normalize_categories(raw):
    if isinstance(raw, dict):
        items_raw = raw.get("data", raw.get("items", raw.get("categories", [])))
    elif isinstance(raw, list):
        items_raw = raw
    else:
        return {"items": [], "raw": raw}

    items = []
    for c in items_raw:
        items.append({
            "id": c.get("id", c.get("category_id", "")),
            "name": c.get("name", c.get("title", c.get("category_name", ""))),
            "parent_id": c.get("parent_id", None),
            "count": c.get("count", c.get("products_count", 0)),
        })

    return {"items": items}
