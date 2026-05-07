CREATE TABLE t_p9295853_modern_shop_developm.product_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_price NUMERIC(12,2),
  quantity INTEGER NOT NULL DEFAULT 1,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);