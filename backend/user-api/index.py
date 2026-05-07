"""
Корзина и заказы пользователей интернет-магазина.
Корзина: cart.get, cart.add, cart.update, cart.remove, cart.clear
Заказы: order.create, order.list
Все действия требуют авторизации через X-Auth-Token.
"""
import json
import os
import random
import psycopg2
from datetime import datetime

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }


def err(msg, status=400):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': msg}, ensure_ascii=False),
    }


def escape(value: str) -> str:
    return str(value).replace("'", "''")


def get_user_id_by_token(conn, token: str):
    cur = conn.cursor()
    cur.execute(
        f"SELECT user_id FROM user_sessions "
        f"WHERE token = '{escape(token)}' AND expires_at > NOW()"
    )
    row = cur.fetchone()
    return row[0] if row else None


def row_to_item(row) -> dict:
    return {
        'id': row[0],
        'product_id': row[2],
        'product_name': row[3],
        'product_price': float(row[4]) if row[4] else 0.0,
        'product_image': row[5],
        'product_sku': row[6],
        'product_unit': row[7],
        'quantity': row[8],
        'store_id': row[9],
        'store_name': row[10],
        'max_quantity': row[11],
    }


# --- CART ---

def handle_cart_get(conn, user_id: int) -> dict:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, user_id, product_id, product_name, product_price, "
        f"product_image, product_sku, product_unit, quantity, store_id, store_name, max_quantity "
        f"FROM cart_items WHERE user_id = {user_id} AND quantity > 0 ORDER BY created_at"
    )
    return ok({'items': [row_to_item(r) for r in cur.fetchall()]})


def handle_cart_add(conn, user_id: int, body: dict) -> dict:
    product_id = str(body.get('product_id', '')).strip()
    product_name = str(body.get('product_name', '')).strip()
    product_image = str(body.get('product_image', '') or '')
    product_sku = str(body.get('product_sku', '') or '')
    product_unit = str(body.get('product_unit', '') or 'шт')
    store_id_raw = body.get('store_id')
    store_id = int(store_id_raw) if store_id_raw is not None else None
    store_name = str(body.get('store_name', '') or '')
    max_qty_raw = body.get('max_quantity')
    max_quantity = int(max_qty_raw) if max_qty_raw is not None else None

    if not product_id:
        return err('Поле product_id обязательно')
    try:
        product_price = float(body.get('product_price', 0))
    except (TypeError, ValueError):
        product_price = 0.0

    # Нельзя добавить 0 в наличии
    if max_quantity is not None and max_quantity <= 0:
        return err('Товар отсутствует на складе')

    quantity = 1

    sid_sql = str(store_id) if store_id is not None else 'NULL'
    sname_sql = f"'{escape(store_name)}'" if store_name else 'NULL'
    mq_sql = str(max_quantity) if max_quantity is not None else 'NULL'

    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO cart_items "
        f"(user_id, product_id, product_name, product_price, product_image, product_sku, product_unit, quantity, store_id, store_name, max_quantity) "
        f"VALUES ({user_id}, '{escape(product_id)}', '{escape(product_name)}', {product_price}, "
        f"'{escape(product_image)}', '{escape(product_sku)}', '{escape(product_unit)}', {quantity}, {sid_sql}, {sname_sql}, {mq_sql}) "
        f"ON CONFLICT (user_id, product_id) DO UPDATE SET "
        f"quantity = CASE WHEN cart_items.quantity < 0 THEN {quantity} ELSE LEAST(cart_items.quantity + {quantity}, COALESCE(EXCLUDED.max_quantity, cart_items.quantity + {quantity})) END, "
        f"product_name = EXCLUDED.product_name, product_price = EXCLUDED.product_price, "
        f"product_image = EXCLUDED.product_image, product_sku = EXCLUDED.product_sku, product_unit = EXCLUDED.product_unit, "
        f"store_id = EXCLUDED.store_id, store_name = EXCLUDED.store_name, max_quantity = EXCLUDED.max_quantity "
        f"RETURNING id, user_id, product_id, product_name, product_price, product_image, product_sku, product_unit, quantity, store_id, store_name, max_quantity"
    )
    row = cur.fetchone()
    conn.commit()
    return ok({'ok': True, 'item': row_to_item(row)})


def handle_cart_update(conn, user_id: int, body: dict) -> dict:
    product_id = str(body.get('product_id', '')).strip()
    quantity = body.get('quantity')
    if not product_id:
        return err('Поле product_id обязательно')
    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return err('quantity должен быть числом')

    if quantity <= 0:
        cur = conn.cursor()
        cur.execute(
            f"UPDATE cart_items SET quantity = -1 "
            f"WHERE user_id = {user_id} AND product_id = '{escape(product_id)}'"
        )
        conn.commit()
        return ok({'ok': True})

    # Ограничиваем по max_quantity из БД
    cur = conn.cursor()
    cur.execute(
        f"SELECT max_quantity FROM cart_items "
        f"WHERE user_id = {user_id} AND product_id = '{escape(product_id)}'"
    )
    row = cur.fetchone()
    max_quantity = row[0] if row and row[0] is not None else None

    if max_quantity is not None and quantity > max_quantity:
        return err(f'Доступно только {max_quantity} шт. на выбранном складе', 400)

    cur.execute(
        f"UPDATE cart_items SET quantity = {quantity} "
        f"WHERE user_id = {user_id} AND product_id = '{escape(product_id)}'"
    )
    conn.commit()
    return ok({'ok': True})


def handle_cart_remove(conn, user_id: int, body: dict) -> dict:
    product_id = str(body.get('product_id', '')).strip()
    if not product_id:
        return err('Поле product_id обязательно')
    cur = conn.cursor()
    cur.execute(
        f"UPDATE cart_items SET quantity = -1 "
        f"WHERE user_id = {user_id} AND product_id = '{escape(product_id)}'"
    )
    conn.commit()
    return ok({'ok': True})


def handle_cart_clear(conn, user_id: int) -> dict:
    cur = conn.cursor()
    cur.execute(f"UPDATE cart_items SET quantity = -1 WHERE user_id = {user_id}")
    conn.commit()
    return ok({'ok': True})


# --- ORDERS ---

def handle_order_create(conn, user_id: int, body: dict) -> dict:
    customer_name = str(body.get('customer_name', '') or '').strip()
    customer_phone = str(body.get('customer_phone', '') or '').strip()
    delivery_type = str(body.get('delivery_type', '') or '').strip()
    address = str(body.get('address', '') or '').strip()
    comment = str(body.get('comment', '') or '').strip()

    if not customer_name:
        return err('Введите имя')
    if not customer_phone:
        return err('Введите телефон')
    if delivery_type not in ('pickup', 'delivery'):
        return err('Укажите способ доставки')
    if delivery_type == 'delivery' and not address:
        return err('Введите адрес доставки')

    cur = conn.cursor()
    cur.execute(
        f"SELECT id, user_id, product_id, product_name, product_price, "
        f"product_image, product_sku, product_unit, quantity, store_id, store_name, max_quantity "
        f"FROM cart_items WHERE user_id = {user_id} AND quantity > 0 ORDER BY created_at"
    )
    rows = cur.fetchall()
    if not rows:
        return err('Корзина пуста')

    # Проверяем доступное количество по каждому товару
    stock_errors = []
    items = []
    total_price = 0.0
    for r in rows:
        price = float(r[4]) if r[4] else 0.0
        qty = int(r[8])
        max_qty = r[11]
        if max_qty is not None and qty > max_qty:
            stock_errors.append(
                f'«{r[3]}»: заказано {qty} шт., доступно {max_qty} шт.'
            )
        total_price += price * qty
        items.append({
            'product_id': r[2], 'product_name': r[3],
            'product_price': price, 'product_image': r[5],
            'product_sku': r[6], 'product_unit': r[7], 'quantity': qty,
            'store_id': r[9], 'store_name': r[10],
        })

    if stock_errors:
        return err('Недостаточно товара на складе: ' + '; '.join(stock_errors))

    if delivery_type == 'delivery' and total_price < 1000:
        return err('Минимальная сумма заказа для доставки — 1000 ₽')

    order_number = 'ORD-' + datetime.now().strftime('%Y%m%d') + '-' + str(random.randint(1000, 9999))
    items_json = json.dumps(items, ensure_ascii=False)

    cur.execute(
        f"INSERT INTO orders "
        f"(order_number, user_id, customer_name, customer_phone, delivery_type, address, comment, items, total_price, status) "
        f"VALUES ('{escape(order_number)}', {user_id}, '{escape(customer_name)}', '{escape(customer_phone)}', "
        f"'{escape(delivery_type)}', '{escape(address)}', '{escape(comment)}', "
        f"'{escape(items_json)}'::jsonb, {total_price}, 'new') RETURNING id"
    )
    order_id = cur.fetchone()[0]
    cur.execute(f"UPDATE cart_items SET quantity = -1 WHERE user_id = {user_id} AND quantity > 0")
    conn.commit()

    return ok({'ok': True, 'order_id': order_id, 'order_number': order_number,
               'total_price': total_price, 'items_count': len(items)})


def handle_order_list(conn, user_id: int) -> dict:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, order_number, total_price, status, delivery_type, created_at "
        f"FROM orders WHERE user_id = {user_id} ORDER BY created_at DESC"
    )
    orders = [
        {'id': r[0], 'order_number': r[1], 'total_price': float(r[2]) if r[2] else 0.0,
         'status': r[3], 'delivery_type': r[4], 'created_at': r[5]}
        for r in cur.fetchall()
    ]
    return ok({'orders': orders})


# --- ENTRY POINT ---

def handler(event: dict, context) -> dict:
    """Корзина и заказы пользователей магазина."""
    method = event.get('httpMethod', 'POST').upper()
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    token = headers.get('x-auth-token', '').strip()
    if not token:
        return err('Не авторизован', 401)

    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        return err('Некорректный JSON')

    conn = get_db()
    try:
        user_id = get_user_id_by_token(conn, token)
        if not user_id:
            return err('Не авторизован', 401)

        action = body.get('action', '')

        if action == 'cart.get':
            return handle_cart_get(conn, user_id)
        if action == 'cart.add':
            return handle_cart_add(conn, user_id, body)
        if action == 'cart.update':
            return handle_cart_update(conn, user_id, body)
        if action == 'cart.remove':
            return handle_cart_remove(conn, user_id, body)
        if action == 'cart.clear':
            return handle_cart_clear(conn, user_id)
        if action == 'order.create':
            return handle_order_create(conn, user_id, body)
        if action == 'order.list':
            return handle_order_list(conn, user_id)

        return err(f'Неизвестный action: {action}')
    finally:
        conn.close()