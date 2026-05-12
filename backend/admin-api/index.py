"""
Админ API для управления интернет-магазином.
Разделы: авторизация, пользователи, баннеры, локации, склады, заказы, настройки, каталог (прокси к внешнему API).
"""
import json
import os
import hashlib
import secrets
import psycopg2
import boto3
import base64
import uuid
from datetime import datetime, timedelta

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Access-Control-Max-Age': '86400',
}

PROMASTER_API_URL = "https://functions.poehali.dev/c7265605-961b-48cb-9594-4caad2cb333e"
VERSION = "1.2"

import urllib.request
import urllib.error


SCHEMA = 't_p9295853_modern_shop_developm'

def get_db():
    conn = psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')
    return conn


def ok(data, status=200):
    return {'statusCode': status, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {'statusCode': status, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def hash_password(pwd):
    return hashlib.sha256(pwd.encode()).hexdigest()


def verify_token(headers):
    token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    if not token:
        return None
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id, u.name, u.email, u.role FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE",
        (token,)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {'id': row[0], 'name': row[1], 'email': row[2], 'role': row[3]}


def handle_login(body):
    email = body.get('email', '').strip()
    password = body.get('password', '')
    if not email or not password:
        return err('Email и пароль обязательны')
    conn = get_db()
    cur = conn.cursor()
    pwd_hash = hash_password(password)
    cur.execute(
        "SELECT id, name, email, role FROM admin_users WHERE email = %s AND (password_hash = %s OR password_hash = %s) AND is_active = TRUE",
        (email, password, pwd_hash)
    )
    user = cur.fetchone()
    if not user:
        conn.close()
        return err('Неверный email или пароль', 401)
    token = secrets.token_hex(32)
    expires = datetime.now() + timedelta(days=7)
    cur.execute(
        "INSERT INTO admin_sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
        (user[0], token, expires)
    )
    conn.commit()
    conn.close()
    return ok({'token': token, 'user': {'id': user[0], 'name': user[1], 'email': user[2], 'role': user[3]}})


def handle_logout(headers):
    token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    if token:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("UPDATE admin_sessions SET expires_at = NOW() WHERE token = %s", (token,))
        conn.commit()
        conn.close()
    return ok({'ok': True})


def handle_me(headers):
    user = verify_token(headers)
    if not user:
        return err('Не авторизован', 401)
    return ok(user)


# --- USERS ---
def handle_users(method, body, user):
    conn = get_db()
    cur = conn.cursor()
    if method == 'GET':
        cur.execute("SELECT id, name, email, role, is_active, created_at FROM admin_users ORDER BY id")
        rows = cur.fetchall()
        conn.close()
        return ok({'items': [{'id': r[0], 'name': r[1], 'email': r[2], 'role': r[3], 'is_active': r[4], 'created_at': r[5]} for r in rows]})
    if method == 'POST':
        name = body.get('name', '').strip()
        email = body.get('email', '').strip()
        password = body.get('password', '')
        role = body.get('role', 'admin')
        if not name or not email or not password:
            conn.close()
            return err('Имя, email и пароль обязательны')
        pwd_hash = hash_password(password)
        cur.execute(
            "INSERT INTO admin_users (name, email, password_hash, role) VALUES (%s, %s, %s, %s) RETURNING id",
            (name, email, pwd_hash, role)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id, 'name': name, 'email': email, 'role': role}, 201)
    if method == 'PUT':
        uid = body.get('id')
        if not uid:
            conn.close()
            return err('ID обязателен')
        fields = []
        vals = []
        if 'name' in body:
            fields.append('name = %s'); vals.append(body['name'])
        if 'email' in body:
            fields.append('email = %s'); vals.append(body['email'])
        if 'role' in body:
            fields.append('role = %s'); vals.append(body['role'])
        if 'is_active' in body:
            fields.append('is_active = %s'); vals.append(body['is_active'])
        if 'password' in body and body['password']:
            fields.append('password_hash = %s'); vals.append(hash_password(body['password']))
        if not fields:
            conn.close()
            return err('Нечего обновлять')
        fields.append('updated_at = NOW()')
        vals.append(uid)
        cur.execute(f"UPDATE admin_users SET {', '.join(fields)} WHERE id = %s", vals)
        conn.commit()
        conn.close()
        return ok({'ok': True})
    conn.close()
    return err('Метод не поддерживается', 405)


# --- S3 UPLOAD ---
def upload_image_to_s3(base64_data: str, filename: str) -> str:
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'jpg'
    key = f"banners/{uuid.uuid4().hex}.{ext}"
    content_type = f"image/{ext}" if ext != 'jpg' else 'image/jpeg'
    if ',' in base64_data:
        base64_data = base64_data.split(',', 1)[1]
    data = base64.b64decode(base64_data)
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


# --- BANNERS ---
def handle_banners(method, body, params):
    conn = get_db()
    cur = conn.cursor()
    if method == 'GET':
        cur.execute("SELECT id, title, subtitle, image_url, link, button_text, is_active, sort_order, created_at, timer, effect, bg_color FROM banners ORDER BY sort_order, id")
        rows = cur.fetchall()
        conn.close()
        return ok({'items': [{'id': r[0], 'title': r[1], 'subtitle': r[2], 'image_url': r[3], 'link': r[4], 'button_text': r[5], 'is_active': r[6], 'sort_order': r[7], 'created_at': r[8], 'timer': r[9] or 5000, 'effect': r[10] or 'slide', 'bg_color': r[11] or ''} for r in rows]})
    if method == 'POST':
        image_url = body.get('image_url', '')
        if body.get('image_base64') and body.get('image_filename'):
            image_url = upload_image_to_s3(body['image_base64'], body['image_filename'])
        cur.execute(
            "INSERT INTO banners (title, subtitle, image_url, link, button_text, is_active, sort_order, timer, effect, bg_color) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (body.get('title'), body.get('subtitle'), image_url, body.get('link'), body.get('button_text'), body.get('is_active', True), body.get('sort_order', 0), body.get('timer', 5000), body.get('effect', 'slide'), body.get('bg_color', ''))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id, 'image_url': image_url}, 201)
    if method == 'PUT':
        bid = body.get('id')
        if not bid:
            conn.close()
            return err('ID обязателен')
        if body.get('image_base64') and body.get('image_filename'):
            image_url = upload_image_to_s3(body['image_base64'], body['image_filename'])
        elif 'image_url' in body:
            image_url = body['image_url']
        else:
            cur.execute("SELECT image_url FROM banners WHERE id = %s", (bid,))
            row = cur.fetchone()
            image_url = row[0] if row else ''
        cur.execute(
            "UPDATE banners SET title=%s, subtitle=%s, image_url=%s, link=%s, button_text=%s, is_active=%s, sort_order=%s, timer=%s, effect=%s, bg_color=%s, updated_at=NOW() WHERE id=%s",
            (body.get('title'), body.get('subtitle'), image_url, body.get('link'), body.get('button_text'), body.get('is_active', True), body.get('sort_order', 0), body.get('timer', 5000), body.get('effect', 'slide'), body.get('bg_color', ''), bid)
        )
        conn.commit()
        conn.close()
        return ok({'ok': True})
    if method == 'DELETE':
        bid = params.get('id') or body.get('id')
        if not bid:
            conn.close()
            return err('ID обязателен')
        cur.execute("DELETE FROM banners WHERE id = %s", (bid,))
        conn.commit()
        conn.close()
        return ok({'ok': True})
    conn.close()
    return err('Метод не поддерживается', 405)


# --- LOCATIONS ---
def handle_locations(method, body, params):
    conn = get_db()
    cur = conn.cursor()
    if method == 'GET':
        cur.execute("SELECT id, name, address, city, phone, email, working_hours, lat, lng, is_active, sort_order FROM locations ORDER BY sort_order, id")
        rows = cur.fetchall()
        conn.close()
        return ok({'items': [{'id': r[0], 'name': r[1], 'address': r[2], 'city': r[3], 'phone': r[4], 'email': r[5], 'working_hours': r[6], 'lat': r[7], 'lng': r[8], 'is_active': r[9], 'sort_order': r[10]} for r in rows]})
    if method == 'POST':
        cur.execute(
            "INSERT INTO locations (name, address, city, phone, email, working_hours, lat, lng, is_active, sort_order) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (body.get('name'), body.get('address'), body.get('city'), body.get('phone'), body.get('email'), body.get('working_hours'), body.get('lat'), body.get('lng'), body.get('is_active', True), body.get('sort_order', 0))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id}, 201)
    if method == 'PUT':
        lid = body.get('id')
        if not lid:
            conn.close()
            return err('ID обязателен')
        cur.execute(
            "UPDATE locations SET name=%s, address=%s, city=%s, phone=%s, email=%s, working_hours=%s, lat=%s, lng=%s, is_active=%s, sort_order=%s WHERE id=%s",
            (body.get('name'), body.get('address'), body.get('city'), body.get('phone'), body.get('email'), body.get('working_hours'), body.get('lat'), body.get('lng'), body.get('is_active', True), body.get('sort_order', 0), lid)
        )
        conn.commit()
        conn.close()
        return ok({'ok': True})
    if method == 'DELETE':
        lid = params.get('id') or body.get('id')
        if not lid:
            conn.close()
            return err('ID обязателен')
        cur.execute("UPDATE locations SET is_active = FALSE WHERE id = %s", (lid,))
        conn.commit()
        conn.close()
        return ok({'ok': True})
    conn.close()
    return err('Метод не поддерживается', 405)


# --- LOCATION STORES (привязка складов ProMaster к локациям) ---
def handle_location_stores(method, body, params):
    conn = get_db()
    cur = conn.cursor()
    if method == 'GET':
        location_id = params.get('location_id')
        if location_id:
            cur.execute("SELECT store_id, store_name FROM location_stores WHERE location_id = %s", (location_id,))
            rows = cur.fetchall()
            conn.close()
            return ok({'store_ids': [r[0] for r in rows], 'stores': [{'store_id': r[0], 'store_name': r[1]} for r in rows]})
        # Все привязки — group by location
        cur.execute("SELECT location_id, store_id, store_name FROM location_stores ORDER BY location_id")
        rows = cur.fetchall()
        conn.close()
        result = {}
        for r in rows:
            lid = r[0]
            if lid not in result:
                result[lid] = []
            result[lid].append({'store_id': r[1], 'store_name': r[2]})
        return ok({'by_location': result})
    if method == 'POST':
        location_id = body.get('location_id')
        store_ids = body.get('store_ids', [])
        store_names = body.get('store_names', {})
        if not location_id:
            conn.close()
            return err('location_id обязателен')
        # Помечаем все существующие как неактивные (store_id = -abs(store_id))
        cur.execute("SELECT id, store_id FROM location_stores WHERE location_id = %s AND store_id > 0", (location_id,))
        existing = cur.fetchall()
        existing_ids = {r[1]: r[0] for r in existing}
        new_set = set(store_ids)
        # Деактивируем убранные (отрицательный store_id)
        for sid, row_id in existing_ids.items():
            if sid not in new_set:
                cur.execute("UPDATE location_stores SET store_id = %s WHERE id = %s", (-sid, row_id))
        # Вставляем/обновляем активные
        for sid in store_ids:
            sname = store_names.get(str(sid), '')
            cur.execute(
                "INSERT INTO location_stores (location_id, store_id, store_name) VALUES (%s, %s, %s) ON CONFLICT (location_id, store_id) DO UPDATE SET store_name = EXCLUDED.store_name",
                (location_id, sid, sname)
            )
        conn.commit()
        conn.close()
        return ok({'ok': True})
    conn.close()
    return ok({'store_ids': []})


# --- LOCATIONS PUBLIC (для фронтенда магазина) ---
def handle_locations_public():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT l.id, l.name, l.city FROM locations l WHERE l.is_active = TRUE ORDER BY l.sort_order, l.id")
    locs = cur.fetchall()
    cur.execute("SELECT location_id, store_id FROM location_stores WHERE store_id > 0")
    bindings = cur.fetchall()
    conn.close()
    by_location = {}
    for b in bindings:
        lid = b[0]
        if lid not in by_location:
            by_location[lid] = []
        by_location[lid].append(b[1])
    items = [{'id': r[0], 'name': r[1], 'city': r[2], 'store_ids': by_location.get(r[0], [])} for r in locs]
    return ok({'items': items})


# --- WAREHOUSES ---
def handle_warehouses(method, body, params):
    conn = get_db()
    cur = conn.cursor()
    if method == 'GET':
        cur.execute("SELECT id, external_id, name, location_id, address, is_main, is_active FROM warehouses ORDER BY id")
        rows = cur.fetchall()
        conn.close()
        return ok({'items': [{'id': r[0], 'external_id': r[1], 'name': r[2], 'location_id': r[3], 'address': r[4], 'is_main': r[5], 'is_active': r[6]} for r in rows]})
    if method == 'POST':
        cur.execute(
            "INSERT INTO warehouses (external_id, name, location_id, address, is_main, is_active) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (body.get('external_id'), body.get('name'), body.get('location_id'), body.get('address'), body.get('is_main', False), body.get('is_active', True))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id}, 201)
    if method == 'PUT':
        wid = body.get('id')
        if not wid:
            conn.close()
            return err('ID обязателен')
        cur.execute(
            "UPDATE warehouses SET external_id=%s, name=%s, location_id=%s, address=%s, is_main=%s, is_active=%s WHERE id=%s",
            (body.get('external_id'), body.get('name'), body.get('location_id'), body.get('address'), body.get('is_main', False), body.get('is_active', True), wid)
        )
        conn.commit()
        conn.close()
        return ok({'ok': True})
    if method == 'DELETE':
        wid = params.get('id') or body.get('id')
        if not wid:
            conn.close()
            return err('ID обязателен')
        cur.execute("UPDATE warehouses SET is_active = FALSE WHERE id = %s", (wid,))
        conn.commit()
        conn.close()
        return ok({'ok': True})
    conn.close()
    return err('Метод не поддерживается', 405)


# --- SETTINGS ---
def handle_settings(method, body):
    conn = get_db()
    cur = conn.cursor()
    if method == 'GET':
        cur.execute("SELECT key, value, label, group_name FROM shop_settings ORDER BY group_name, id")
        rows = cur.fetchall()
        conn.close()
        return ok({'items': [{'key': r[0], 'value': r[1], 'label': r[2], 'group': r[3]} for r in rows]})
    if method == 'POST':
        items = body.get('items', [])
        for item in items:
            cur.execute(
                "INSERT INTO shop_settings (key, value, label, group_name, updated_at) VALUES (%s, %s, %s, %s, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
                (item['key'], item.get('value', ''), item.get('label', item['key']), item.get('group', 'general'))
            )
        conn.commit()
        conn.close()
        return ok({'ok': True})
    conn.close()
    return err('Метод не поддерживается', 405)


# --- PROMASTER GROUPS / CATEGORIES ---
GROUPS_CACHE_KEY = 'cache_promaster_groups'
GROUPS_CACHE_TTL = 600  # 10 минут

def fetch_promaster_groups():
    """Загружает все группы номенклатуры из ProMaster со всех страниц."""
    token = os.environ.get('PROMASTER_API_TOKEN', '')
    all_items = []
    page = 1
    while True:
        req = urllib.request.Request(
            f"https://pm-71723.promaster.app/api/v1/store/getGroups?limit=100&page={page}",
            headers={'Authorization': token, 'Content-type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        items = data.get('items') or []
        all_items.extend(items)
        if page >= (data.get('pages') or 1):
            break
        page += 1
    return all_items

def handle_categories():
    """Возвращает категории (группы) с иерархией parent_id для бокового меню каталога."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT value, updated_at FROM shop_settings WHERE key = %s", (GROUPS_CACHE_KEY,))
    row = cur.fetchone()
    if row and row[0] and row[1]:
        age = (datetime.now() - row[1].replace(tzinfo=None)).total_seconds()
        if age < GROUPS_CACHE_TTL:
            conn.close()
            return ok({'items': json.loads(row[0]), 'cached': True})
    groups = fetch_promaster_groups()
    result = [
        {
            'id': g.get('id'),
            'name': g.get('name', ''),
            'parent_id': g.get('parentId') if g.get('parentId') else None,
            'count': 0,
        }
        for g in groups
    ]
    if result:
        cur.execute(
            "INSERT INTO shop_settings (key, value, label, group_name, updated_at) VALUES (%s, %s, 'Кеш групп ProMaster', 'cache', NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
            (GROUPS_CACHE_KEY, json.dumps(result))
        )
        conn.commit()
    conn.close()
    return ok({'items': result})

def handle_promaster_groups():
    """Возвращает сырые группы номенклатуры из ProMaster."""
    groups = fetch_promaster_groups()
    return ok({'items': groups, 'count': len(groups)})


# --- PROMASTER STORES ---
STORES_CACHE_KEY = 'cache_promaster_stores'
STORES_CACHE_TTL = 600  # 10 минут

def handle_promaster_stores():
    """Возвращает список складов из ProMaster API с кешем 10 мин в БД."""
    conn = get_db()
    cur = conn.cursor()

    # Читаем кеш
    cur.execute(
        "SELECT value, updated_at FROM shop_settings WHERE key = %s",
        (STORES_CACHE_KEY,)
    )
    row = cur.fetchone()
    if row and row[0] and row[1]:
        age = (datetime.now() - row[1].replace(tzinfo=None)).total_seconds()
        if age < STORES_CACHE_TTL:
            conn.close()
            return ok({'items': json.loads(row[0]), 'cached': True})

    # Запрашиваем у ProMaster
    stores = None
    try:
        token = os.environ.get('PROMASTER_API_TOKEN', '')
        req = urllib.request.Request(
            "https://pm-71723.promaster.app/api/v1/store/getStores?limit=100",
            headers={'Authorization': token}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        fetched = [{'id': s.get('id'), 'name': s.get('name', ''), 'main': s.get('main', False)} for s in (data.get('items') or [])]
        if fetched:
            stores = fetched
    except Exception:
        pass

    # Сохраняем в кеш если получили данные
    if stores:
        cur.execute(
            "INSERT INTO shop_settings (key, value, label, group_name, updated_at) VALUES (%s, %s, 'Кеш складов ProMaster', 'cache', NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
            (STORES_CACHE_KEY, json.dumps(stores))
        )
        conn.commit()
        conn.close()
        return ok({'items': stores})

    # Fallback: устаревший кеш или location_stores
    if row and row[0]:
        conn.close()
        return ok({'items': json.loads(row[0]), 'cached': True})

    cur.execute("SELECT DISTINCT store_id, store_name FROM location_stores WHERE store_id > 0 ORDER BY store_id")
    rows = cur.fetchall()
    conn.close()
    return ok({'items': [{'id': r[0], 'name': r[1] or f'Склад #{r[0]}', 'main': False} for r in rows]})


# --- SHOP WAREHOUSES (выбранные склады для магазина) ---
def handle_shop_warehouses(method, body):
    conn = get_db()
    cur = conn.cursor()
    if method == 'GET':
        cur.execute("SELECT value FROM shop_settings WHERE key = 'visible_store_ids'")
        row = cur.fetchone()
        conn.close()
        ids = json.loads(row[0]) if row and row[0] else []
        return ok({'store_ids': ids})
    if method == 'POST':
        store_ids = body.get('store_ids', [])
        value = json.dumps(store_ids)
        cur.execute(
            "INSERT INTO shop_settings (key, value, label, group_name) VALUES ('visible_store_ids', %s, 'Видимые склады', 'warehouses') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
            (value,)
        )
        conn.commit()
        conn.close()
        return ok({'ok': True})
    conn.close()
    return ok({'store_ids': []})


# --- PRODUCT REQUESTS ---
def handle_requests(method, body, params):
    conn = get_db()
    cur = conn.cursor()
    schema = 't_p9295853_modern_shop_developm'
    if method == 'GET':
        page = int(params.get('page', 1))
        per_page = int(params.get('per_page', 20))
        status_filter = params.get('status', '')
        offset = (page - 1) * per_page
        where = "WHERE 1=1"
        vals = []
        if status_filter:
            where += " AND status = %s"
            vals.append(status_filter)
        cur.execute(f"SELECT COUNT(*) FROM {schema}.product_requests {where}", vals)
        total = cur.fetchone()[0]
        cur.execute(
            f"SELECT id, product_id, product_name, product_sku, product_price, quantity, customer_name, customer_phone, comment, status, created_at "
            f"FROM {schema}.product_requests {where} ORDER BY created_at DESC LIMIT %s OFFSET %s",
            vals + [per_page, offset]
        )
        rows = cur.fetchall()
        conn.close()
        return ok({'items': [{'id': r[0], 'product_id': r[1], 'product_name': r[2], 'product_sku': r[3],
                               'product_price': float(r[4]) if r[4] else 0, 'quantity': r[5],
                               'customer_name': r[6], 'customer_phone': r[7], 'comment': r[8],
                               'status': r[9], 'created_at': r[10]} for r in rows], 'total': total})
    if method == 'PUT':
        rid = body.get('id')
        new_status = body.get('status')
        if not rid:
            conn.close()
            return err('ID обязателен')
        cur.execute(f"UPDATE {schema}.product_requests SET status = %s WHERE id = %s", (new_status, rid))
        conn.commit()
        conn.close()
        return ok({'ok': True})
    conn.close()
    return err('Метод не поддерживается', 405)


# --- ORDERS ---
def handle_orders(method, body, params):
    conn = get_db()
    cur = conn.cursor()
    if method == 'GET':
        page = int(params.get('page', 1))
        per_page = int(params.get('per_page', 20))
        status_filter = params.get('status', '')
        offset = (page - 1) * per_page
        where = "WHERE 1=1"
        vals = []
        if status_filter:
            where += " AND status = %s"
            vals.append(status_filter)
        cur.execute(f"SELECT COUNT(*) FROM orders {where}", vals)
        total = cur.fetchone()[0]
        cur.execute(f"SELECT id, order_number, customer_name, customer_phone, customer_email, address, items, total_price, status, comment, warehouse_id, created_at FROM orders {where} ORDER BY created_at DESC LIMIT %s OFFSET %s", vals + [per_page, offset])
        rows = cur.fetchall()
        conn.close()
        return ok({'items': [{'id': r[0], 'order_number': r[1], 'customer_name': r[2], 'customer_phone': r[3], 'customer_email': r[4], 'address': r[5], 'items': r[6], 'total_price': float(r[7]) if r[7] else 0, 'status': r[8], 'comment': r[9], 'warehouse_id': r[10], 'created_at': r[11]} for r in rows], 'total': total, 'page': page, 'per_page': per_page})
    if method == 'PUT':
        oid = body.get('id')
        new_status = body.get('status')
        if not oid:
            conn.close()
            return err('ID обязателен')
        cur.execute("UPDATE orders SET status = %s, updated_at = NOW() WHERE id = %s", (new_status, oid))
        conn.commit()
        conn.close()
        return ok({'ok': True})
    conn.close()
    return err('Метод не поддерживается', 405)


def handler(event: dict, context) -> dict:
    """Главный обработчик admin API"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    action = params.get('action', '')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    # Публичные маршруты
    if action == 'login' and method == 'POST':
        return handle_login(body)
    if action == 'banners' and method == 'GET':
        return handle_banners('GET', {}, params)
    if action == 'shop_warehouses' and method == 'GET':
        return handle_shop_warehouses('GET', {})
    if action == 'locations_public' and method == 'GET':
        return handle_locations_public()
    if action == 'promaster_groups' and method == 'GET':
        return handle_promaster_groups()
    if action == 'categories' and method == 'GET':
        return handle_categories()

    # Защищённые маршруты
    print(f"[DEBUG] method={method} action={action} headers_keys={list(headers.keys())} body_keys={list(body.keys()) if body else []}")
    user = verify_token(headers)
    print(f"[DEBUG] user={user}")
    if not user:
        return err('Не авторизован', 401)

    if action == 'logout':
        return handle_logout(headers)
    if action == 'me':
        return handle_me(headers)
    if action == 'users':
        return handle_users(method, body, user)
    if action == 'banners':
        return handle_banners(method, body, params)
    if action == 'locations':
        return handle_locations(method, body, params)
    if action == 'warehouses':
        return handle_warehouses(method, body, params)
    if action == 'settings':
        return handle_settings(method, body)
    if action == 'orders':
        return handle_orders(method, body, params)
    if action == 'requests':
        return handle_requests(method, body, params)
    if action == 'promaster_stores':
        return handle_promaster_stores()
    if action == 'promaster_groups':
        return handle_promaster_groups()
    if action == 'shop_warehouses':
        return handle_shop_warehouses(method, body)
    if action == 'location_stores':
        return handle_location_stores(method, body, params)

    return err('Неизвестный action', 404)