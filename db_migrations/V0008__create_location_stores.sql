CREATE TABLE IF NOT EXISTS location_stores (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL REFERENCES locations(id),
  store_id INTEGER NOT NULL,
  store_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, store_id)
);