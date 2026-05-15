"""
API каталога из базы данных проекта.
GET ?action=products|categories|product|featured|sync_status
POST ?action=sync|update_schedule|stock_check
"""
import json
import os
import psycopg2
import urllib.request

SCHEMA = 't_p9295853_modern_shop_developm'
CRM_API_URL = "https://functions.poehali.dev/c7265605-961b-48cb-9594-4caad2cb333e"
PER_PAGE = 24
SYNC_PER_PAGE = 100

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Access-Control-Max-Age': '86400',
}


def ok(data, status=200):
    return {'statusCode': status, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {'statusCode': status, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')


def verify_admin_token(headers):
    token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    if not token:
        return None
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE",
        (token,)
    )
    row = cur.fetchone()
    conn.close()
    return row[0] if row else None


def product_row_to_dict(row, stock_map):
    pid = row[0]
    stock = stock_map.get(pid, [])
    in_stock = any(s['quantity'] > 0 for s in stock)
    return {
        'id': pid,
        'name': row[1],
        'sku': row[2] or '',
        'price': float(row[3]),
        'old_price': float(row[4]) if row[4] else None,
        'image': row[5] or '',
        'description': row[6] or '',
        'category_id': row[7],
        'category_name': row[8] or '',
        'unit': row[9] or 'шт',
        'in_stock': in_stock,
        'stock_by_store': stock,
    }


def load_stock_for_products(cur, product_ids):
    if not product_ids:
        return {}
    cur.execute(
        "SELECT product_id, store_id, store_name, quantity FROM catalog_stock WHERE product_id = ANY(%s)",
        (list(product_ids),)
    )
    stock_map = {}
    for r in cur.fetchall():
        pid = r[0]
        if pid not in stock_map:
            stock_map[pid] = []
        stock_map[pid].append({'store_id': r[1], 'store_name': r[2], 'quantity': r[3]})
    return stock_map


def fetch_crm_page(page):
    url = f"{CRM_API_URL}?action=products&per_page={SYNC_PER_PAGE}&page={page}"
    req = urllib.request.Request(url, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw = json.loads(resp.read().decode('utf-8'))
    if isinstance(raw.get('body'), str):
        raw = json.loads(raw['body'])
    print(f"[fetch_crm_page] page={page} items={len(raw.get('items') or [])} pages={raw.get('pages')}")
    return raw.get('items') or [], int(raw.get('pages') or 1)


def fetch_crm_categories():
    url = f"{CRM_API_URL}?action=categories"
    req = urllib.request.Request(url, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        raw = json.loads(resp.read().decode('utf-8'))
    if isinstance(raw.get('body'), str):
        raw = json.loads(raw['body'])
    return raw.get('items') or raw.get('categories') or []


def sync_categories():
    """Синхронизирует категории из CRM."""
    conn = get_db()
    cur = conn.cursor()
    count = 0
    try:
        cats = fetch_crm_categories()
        for cat in cats:
            cid = cat.get('id')
            if not cid:
                continue
            cur.execute(
                """INSERT INTO catalog_categories (id, name, parent_id, synced_at)
                   VALUES (%s,%s,%s,NOW())
                   ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, parent_id=EXCLUDED.parent_id, synced_at=NOW()""",
                (int(cid), cat.get('name', ''), int(cat['parent_id']) if cat.get('parent_id') else None)
            )
            count += 1
        conn.commit()
    finally:
        conn.close()
    return count


def sync_page(page):
    """Синхронизирует одну страницу товаров из CRM. Возвращает (synced, total_pages)."""
    items, total_pages = fetch_crm_page(page)
    conn = get_db()
    cur = conn.cursor()
    synced = 0
    try:
        for p in items:
            pid = p.get('id')
            if not pid:
                continue
            pid = int(pid)
            price = float(p.get('price') or 0)
            old_price = float(p.get('old_price') or 0) or None
            category_id = p.get('category_id')

            cur.execute(
                """INSERT INTO catalog_products (id, name, sku, price, old_price, image_url, description, category_id, category_name, unit, is_active, synced_at, updated_at)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,TRUE,NOW(),NOW())
                   ON CONFLICT (id) DO UPDATE SET
                     name=EXCLUDED.name, sku=EXCLUDED.sku, price=EXCLUDED.price,
                     old_price=EXCLUDED.old_price, image_url=EXCLUDED.image_url,
                     description=EXCLUDED.description, category_id=EXCLUDED.category_id,
                     category_name=EXCLUDED.category_name, unit=EXCLUDED.unit,
                     is_active=TRUE, synced_at=NOW(), updated_at=NOW()""",
                (pid, p.get('name') or '', p.get('sku') or p.get('article') or '',
                 price, old_price, p.get('image') or p.get('image_url') or '',
                 p.get('description') or '',
                 int(category_id) if category_id else None,
                 p.get('category_name') or '', p.get('unit') or 'шт')
            )

            for s in (p.get('stock_by_store') or []):
                store_id = s.get('store_id')
                if store_id is None:
                    continue
                cur.execute(
                    """INSERT INTO catalog_stock (product_id, store_id, store_name, quantity, updated_at)
                       VALUES (%s,%s,%s,%s,NOW())
                       ON CONFLICT (product_id, store_id) DO UPDATE SET
                         store_name=EXCLUDED.store_name, quantity=EXCLUDED.quantity, updated_at=NOW()""",
                    (pid, int(store_id), s.get('store_name') or '', int(s.get('quantity') or 0))
                )
            synced += 1

        conn.commit()
        print(f"[catalog-sync] page {page}/{total_pages}, synced: {synced}")
    except Exception as e:
        print(f"[sync_page] ERROR page={page}: {type(e).__name__}: {e}")
        conn.rollback()
        conn.close()
        raise e
    conn.close()
    return synced, total_pages


def finish_sync(total_synced):
    """Обновляет статус после завершения синхронизации."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """UPDATE catalog_sync_schedule SET last_sync_at=NOW(), last_sync_status='ok', last_sync_count=%s, last_sync_error=NULL, updated_at=NOW()
           WHERE id=(SELECT id FROM catalog_sync_schedule ORDER BY id LIMIT 1)""",
        (total_synced,)
    )
    conn.commit()
    conn.close()


def handler(event: dict, context) -> dict:
    """Каталог товаров из БД + синхронизация с CRM."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    action = params.get('action', 'products')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    # POST: защищённые
    if method == 'POST':
        if action in ('sync', 'sync_categories', 'sync_page', 'sync_finish', 'update_schedule'):
            if not verify_admin_token(headers):
                return err('Не авторизован', 401)

        if action == 'update_schedule':
            times = body.get('times', [])
            is_active = body.get('is_active', True)
            if not isinstance(times, list) or len(times) < 1:
                return err('times должен быть массивом строк')
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                "UPDATE catalog_sync_schedule SET times=%s, is_active=%s, updated_at=NOW() WHERE id=(SELECT id FROM catalog_sync_schedule ORDER BY id LIMIT 1)",
                (json.dumps(times), is_active)
            )
            conn.commit()
            conn.close()
            return ok({'ok': True})

        if action == 'sync_categories':
            try:
                count = sync_categories()
                return ok({'ok': True, 'count': count})
            except Exception as e:
                return err(f'Ошибка загрузки категорий: {e}', 500)

        if action == 'sync_page':
            page = int(body.get('page', 1))
            try:
                synced, total_pages = sync_page(page)
                return ok({'ok': True, 'synced': synced, 'page': page, 'total_pages': total_pages})
            except Exception as e:
                return err(f'Ошибка загрузки страницы {page}: {e}', 500)

        if action == 'sync_finish':
            total_synced = int(body.get('total_synced', 0))
            try:
                finish_sync(total_synced)
                return ok({'ok': True})
            except Exception as e:
                return err(f'Ошибка завершения: {e}', 500)

        if action == 'sync':
            # Оставляем для совместимости — синхронизирует только первую страницу
            try:
                sync_categories()
                synced, total_pages = sync_page(1)
                if total_pages == 1:
                    finish_sync(synced)
                    return ok({'ok': True, 'synced': synced, 'total_pages': 1})
                return ok({'ok': True, 'synced': synced, 'total_pages': total_pages, 'page': 1})
            except Exception as e:
                try:
                    conn = get_db()
                    cur = conn.cursor()
                    cur.execute(
                        "UPDATE catalog_sync_schedule SET last_sync_at=NOW(), last_sync_status='error', last_sync_error=%s, updated_at=NOW() WHERE id=(SELECT id FROM catalog_sync_schedule ORDER BY id LIMIT 1)",
                        (str(e),)
                    )
                    conn.commit()
                    conn.close()
                except Exception:
                    pass
                return err(f'Ошибка синхронизации: {e}', 500)

        if action == 'stock_check':
            cart_items = body.get('items') or []
            if not cart_items:
                return ok({'items': []})
            conn = get_db()
            cur = conn.cursor()
            results = []
            for ci in cart_items:
                pid = ci.get('product_id')
                store_id = ci.get('store_id')
                qty = int(ci.get('quantity', 1))
                cur.execute("SELECT quantity FROM catalog_stock WHERE product_id=%s AND store_id=%s", (int(pid), int(store_id)))
                row = cur.fetchone()
                if row is None:
                    # Товар не найден в catalog_stock — данные неизвестны, не блокируем
                    results.append({'product_id': pid, 'store_id': store_id, 'requested': qty, 'available': None, 'ok': True})
                else:
                    available = row[0]
                    results.append({'product_id': pid, 'store_id': store_id, 'requested': qty, 'available': available, 'ok': available >= qty})
            conn.close()
            return ok({'items': results})

        return err('Неизвестный action', 404)

    # GET
    if action == 'sync_status':
        user_id = verify_admin_token(headers)
        if not user_id:
            return err('Не авторизован', 401)
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT times, is_active, last_sync_at, last_sync_status, last_sync_count, last_sync_error FROM catalog_sync_schedule ORDER BY id LIMIT 1")
        row = cur.fetchone()
        cur.execute("SELECT COUNT(*) FROM catalog_products WHERE is_active=TRUE")
        product_count = cur.fetchone()[0]
        conn.close()
        if not row:
            return ok({'times': ['08:00', '14:00', '20:00'], 'is_active': True, 'last_sync_at': None, 'product_count': product_count})
        return ok({
            'times': row[0] if isinstance(row[0], list) else json.loads(row[0]),
            'is_active': row[1],
            'last_sync_at': row[2],
            'last_sync_status': row[3],
            'last_sync_count': row[4],
            'last_sync_error': row[5],
            'product_count': product_count,
        })

    if action == 'categories':
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id, name, parent_id FROM catalog_categories ORDER BY name")
        rows = cur.fetchall()
        cur.execute("SELECT category_id, COUNT(*) FROM catalog_products WHERE is_active=TRUE GROUP BY category_id")
        counts = {r[0]: r[1] for r in cur.fetchall()}
        conn.close()
        return ok({'items': [{'id': r[0], 'name': r[1], 'parent_id': r[2], 'count': counts.get(r[0], 0)} for r in rows]})

    if action == 'catalog':
        # Товары + категории за один запрос
        page = int(params.get('page', 1))
        per_page = int(params.get('per_page', PER_PAGE))
        category_id = params.get('category_id')
        search = params.get('search', '').strip()
        in_stock_only = params.get('in_stock_only') == '1'

        conditions = ['p.is_active=TRUE']
        args = []
        if category_id:
            conditions.append('p.category_id=%s')
            args.append(int(category_id))
        if search:
            conditions.append('(p.name ILIKE %s OR p.sku ILIKE %s)')
            args.extend([f'%{search}%', f'%{search}%'])
        if in_stock_only:
            conditions.append('EXISTS (SELECT 1 FROM catalog_stock cs WHERE cs.product_id=p.id AND cs.quantity>0)')

        where = ' AND '.join(conditions)
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT id, name, parent_id FROM catalog_categories ORDER BY name")
        cat_rows = cur.fetchall()
        cur.execute("SELECT category_id, COUNT(*) FROM catalog_products WHERE is_active=TRUE GROUP BY category_id")
        counts = {r[0]: r[1] for r in cur.fetchall()}
        categories = [{'id': r[0], 'name': r[1], 'parent_id': r[2], 'count': counts.get(r[0], 0)} for r in cat_rows]

        cur.execute(f"SELECT COUNT(*) FROM catalog_products p WHERE {where}", args)
        total = cur.fetchone()[0]
        pages = max(1, (total + per_page - 1) // per_page)
        offset = (page - 1) * per_page
        cur.execute(
            f"""SELECT p.id, p.name, p.sku, p.price, p.old_price, p.image_url, p.description, p.category_id, p.category_name, p.unit
                FROM catalog_products p WHERE {where}
                ORDER BY p.name LIMIT %s OFFSET %s""",
            args + [per_page, offset]
        )
        rows = cur.fetchall()
        pids = [r[0] for r in rows]
        stock_map = load_stock_for_products(cur, pids)
        conn.close()
        return ok({
            'categories': categories,
            'items': [product_row_to_dict(r, stock_map) for r in rows],
            'total': total,
            'pages': pages,
            'page': page,
        })

    if action == 'product':
        pid = params.get('id')
        if not pid:
            return err('id обязателен', 400)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, sku, price, old_price, image_url, description, category_id, category_name, unit FROM catalog_products WHERE id=%s AND is_active=TRUE",
            (int(pid),)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return err('Товар не найден', 404)
        stock_map = load_stock_for_products(cur, [row[0]])
        conn.close()
        return ok({'product': product_row_to_dict(row, stock_map)})

    if action == 'featured':
        section = params.get('section', 'daily')
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """SELECT cf.product_id, cf.product_name, cf.product_price, cf.product_image,
                      cp.sku, cp.old_price, cp.description, cp.category_id, cp.category_name, cp.unit
               FROM catalog_featured cf
               LEFT JOIN catalog_products cp ON cp.id=cf.product_id
               WHERE cf.section=%s AND cf.sort_order >= 0
               ORDER BY cf.sort_order, cf.id""",
            (section,)
        )
        rows = cur.fetchall()
        if not rows:
            conn.close()
            return ok({'items': []})
        pids = [r[0] for r in rows]
        stock_map = load_stock_for_products(cur, pids)
        conn.close()
        items = []
        for r in rows:
            pid = r[0]
            stock = stock_map.get(pid, [])
            in_stock = any(s['quantity'] > 0 for s in stock)
            items.append({
                'id': pid,
                'name': r[1] or '',
                'price': float(r[2]) if r[2] else 0,
                'image': r[3] or '',
                'sku': r[4] or '',
                'old_price': float(r[5]) if r[5] else None,
                'description': r[6] or '',
                'category_id': r[7],
                'category_name': r[8] or '',
                'unit': r[9] or 'шт',
                'in_stock': in_stock,
                'stock_by_store': stock,
            })
        return ok({'items': items})

    # action == 'products'
    page = int(params.get('page', 1))
    per_page = int(params.get('per_page', PER_PAGE))
    category_id = params.get('category_id')
    search = params.get('search', '').strip()
    in_stock_only = params.get('in_stock_only') == '1'

    conditions = ['p.is_active=TRUE']
    args = []
    if category_id:
        conditions.append('p.category_id=%s')
        args.append(int(category_id))
    if search:
        conditions.append('(p.name ILIKE %s OR p.sku ILIKE %s)')
        args.extend([f'%{search}%', f'%{search}%'])
    if in_stock_only:
        conditions.append('EXISTS (SELECT 1 FROM catalog_stock cs WHERE cs.product_id=p.id AND cs.quantity>0)')

    where = ' AND '.join(conditions)
    conn = get_db()
    cur = conn.cursor()
    cur.execute(f"SELECT COUNT(*) FROM catalog_products p WHERE {where}", args)
    total = cur.fetchone()[0]
    pages = max(1, (total + per_page - 1) // per_page)
    offset = (page - 1) * per_page

    cur.execute(
        f"""SELECT p.id, p.name, p.sku, p.price, p.old_price, p.image_url, p.description, p.category_id, p.category_name, p.unit
            FROM catalog_products p WHERE {where}
            ORDER BY p.name LIMIT %s OFFSET %s""",
        args + [per_page, offset]
    )
    rows = cur.fetchall()
    pids = [r[0] for r in rows]
    stock_map = load_stock_for_products(cur, pids)
    conn.close()
    return ok({'items': [product_row_to_dict(r, stock_map) for r in rows], 'total': total, 'pages': pages, 'page': page})