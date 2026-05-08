"""
Прокси для получения товара по ID из внешнего каталога.
Принимает GET ?id=<product_id>, возвращает объект товара или ошибку.
"""
import json
import math
import urllib.request

CATALOG_API_URL = "https://functions.poehali.dev/c7265605-961b-48cb-9594-4caad2cb333e"
PER_PAGE = 500
MAX_EXTRA_PAGES = 5

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}


def ok(data: dict) -> dict:
    return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False)}


def err(msg: str, code: int = 404) -> dict:
    return {'statusCode': code, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def fetch_page(page: int):
    url = f"{CATALOG_API_URL}?action=products&per_page={PER_PAGE}&page={page}"
    with urllib.request.urlopen(url, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    if isinstance(data.get('body'), str):
        data = json.loads(data['body'])
    return data.get('items') or [], int(data.get('pages') or 1)


def handler(event: dict, context) -> dict:
    """Поиск товара по ID через внешний каталог. GET ?id=<id>"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    product_id = str(params.get('id', '')).strip()
    if not product_id:
        return err('id is required', 400)

    try:
        numeric_id = int(product_id)
    except ValueError:
        numeric_id = None

    # IDs идут примерно по порядку — вычисляем предсказанную страницу
    start_page = max(1, math.ceil(numeric_id / PER_PAGE)) if numeric_id else 1

    try:
        items, total_pages = fetch_page(start_page)
        found = next((p for p in items if str(p.get('id')) == product_id), None)

        if not found:
            # Соседние страницы: сначала назад, потом вперёд
            candidates = []
            if start_page > 1:
                candidates.append(start_page - 1)
            candidates += list(range(start_page + 1, min(total_pages + 1, start_page + MAX_EXTRA_PAGES + 1)))
            if start_page > 2:
                candidates += list(range(1, start_page - 1))

            for page in candidates[:MAX_EXTRA_PAGES]:
                items, _ = fetch_page(page)
                found = next((p for p in items if str(p.get('id')) == product_id), None)
                if found:
                    break

    except Exception as e:
        return err(f'catalog error: {e}', 502)

    if not found:
        return err('Товар не найден')

    return ok({'product': found})
