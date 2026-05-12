CREATE TABLE IF NOT EXISTS t_p9295853_modern_shop_developm.catalog_categories (
    id BIGINT PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    parent_id BIGINT NULL,
    sort_order INTEGER DEFAULT 0,
    synced_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p9295853_modern_shop_developm.catalog_products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(1000) NOT NULL,
    sku VARCHAR(200),
    price NUMERIC(12,2) DEFAULT 0,
    old_price NUMERIC(12,2) NULL,
    image_url TEXT,
    description TEXT,
    category_id BIGINT,
    category_name VARCHAR(500),
    unit VARCHAR(50) DEFAULT 'шт',
    is_active BOOLEAN DEFAULT TRUE,
    synced_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p9295853_modern_shop_developm.catalog_stock (
    id SERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    store_id INTEGER NOT NULL,
    store_name VARCHAR(300),
    quantity INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, store_id)
);

CREATE TABLE IF NOT EXISTS t_p9295853_modern_shop_developm.catalog_sync_schedule (
    id SERIAL PRIMARY KEY,
    times JSONB NOT NULL DEFAULT '["08:00","14:00","20:00"]',
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP NULL,
    last_sync_status VARCHAR(50) NULL,
    last_sync_count INTEGER NULL,
    last_sync_error TEXT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p9295853_modern_shop_developm.catalog_featured (
    id SERIAL PRIMARY KEY,
    section VARCHAR(50) NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(1000),
    product_price NUMERIC(12,2),
    product_image TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p9295853_modern_shop_developm.catalog_sync_schedule (times, is_active)
SELECT '["08:00","14:00","20:00"]'::jsonb, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM t_p9295853_modern_shop_developm.catalog_sync_schedule LIMIT 1
);

CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON t_p9295853_modern_shop_developm.catalog_products(category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_active ON t_p9295853_modern_shop_developm.catalog_products(is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_stock_product ON t_p9295853_modern_shop_developm.catalog_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_catalog_featured_section ON t_p9295853_modern_shop_developm.catalog_featured(section);
