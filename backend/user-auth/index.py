"""
Авторизация пользователей интернет-магазина.
Actions: register, login, profile, logout.
Токен передаётся через заголовок X-Auth-Token.
"""
import json
import os
import re
import secrets
import psycopg2
from datetime import datetime, timedelta

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


def normalize_phone(raw: str) -> str:
    """Оставляет только цифры, приводит к формату +7XXXXXXXXXX."""
    digits = re.sub(r'\D', '', raw)
    if len(digits) == 11 and digits[0] in ('7', '8'):
        digits = '7' + digits[1:]
    return '+' + digits


def escape(value: str) -> str:
    """Экранирует одинарные кавычки для встраивания в SQL-строку."""
    return value.replace("'", "''")


def create_session(conn, user_id: int) -> str:
    token = secrets.token_hex(32)
    expires = datetime.now() + timedelta(days=30)
    expires_str = expires.strftime('%Y-%m-%d %H:%M:%S')
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO user_sessions (user_id, token, expires_at) "
        f"VALUES ({user_id}, '{escape(token)}', '{expires_str}')"
    )
    conn.commit()
    return token


def get_user_by_token(conn, token: str):
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.id, u.name, u.phone FROM user_sessions s "
        f"JOIN users u ON u.id = s.user_id "
        f"WHERE s.token = '{escape(token)}' AND s.expires_at > NOW()"
    )
    return cur.fetchone()


# --- action handlers ---

def handle_register(body):
    name = body.get('name', '').strip()
    phone_raw = body.get('phone', '').strip()
    if not name or not phone_raw:
        return err('Поля name и phone обязательны')

    phone = normalize_phone(phone_raw)
    if len(re.sub(r'\D', '', phone)) < 11:
        return err('Некорректный номер телефона')

    conn = get_db()
    try:
        cur = conn.cursor()
        # Ищем существующего пользователя
        cur.execute(
            f"SELECT id, name, phone FROM users WHERE phone = '{escape(phone)}'"
        )
        row = cur.fetchone()
        if row:
            user_id, user_name, user_phone = row
        else:
            cur.execute(
                f"INSERT INTO users (name, phone) "
                f"VALUES ('{escape(name)}', '{escape(phone)}') RETURNING id"
            )
            user_id = cur.fetchone()[0]
            user_name = name
            user_phone = phone
            conn.commit()

        token = create_session(conn, user_id)
        return ok({
            'user': {'id': user_id, 'name': user_name, 'phone': user_phone},
            'token': token,
        })
    finally:
        conn.close()


def handle_login(body):
    phone_raw = body.get('phone', '').strip()
    if not phone_raw:
        return err('Поле phone обязательно')

    phone = normalize_phone(phone_raw)

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, name, phone FROM users WHERE phone = '{escape(phone)}'"
        )
        row = cur.fetchone()
        if not row:
            return err('Пользователь не найден', 404)

        user_id, user_name, user_phone = row
        token = create_session(conn, user_id)
        return ok({
            'user': {'id': user_id, 'name': user_name, 'phone': user_phone},
            'token': token,
        })
    finally:
        conn.close()


def handle_profile(headers):
    token = headers.get('x-auth-token') or headers.get('X-Auth-Token') or ''
    if not token:
        return err('Не авторизован', 401)

    conn = get_db()
    try:
        row = get_user_by_token(conn, token)
        if not row:
            return err('Не авторизован', 401)
        user_id, user_name, user_phone = row
        return ok({'user': {'id': user_id, 'name': user_name, 'phone': user_phone}})
    finally:
        conn.close()


def handle_logout(headers):
    token = headers.get('x-auth-token') or headers.get('X-Auth-Token') or ''
    if token:
        conn = get_db()
        try:
            cur = conn.cursor()
            cur.execute(
                f"UPDATE user_sessions SET expires_at = NOW() "
                f"WHERE token = '{escape(token)}'"
            )
            conn.commit()
        finally:
            conn.close()
    return ok({'ok': True})


# --- entry point ---

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', event.get('method', 'POST')).upper()
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'POST':
        return err('Метод не поддерживается', 405)

    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        return err('Некорректный JSON')

    action = body.get('action', '')

    if action == 'register':
        return handle_register(body)
    if action == 'login':
        return handle_login(body)
    if action == 'profile':
        return handle_profile(headers)
    if action == 'logout':
        return handle_logout(headers)

    return err(f'Неизвестный action: {action}')
