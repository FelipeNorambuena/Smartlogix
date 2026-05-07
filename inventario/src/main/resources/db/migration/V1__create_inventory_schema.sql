CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) NOT NULL,
  sku VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NULL,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  category VARCHAR(255) NULL,
  is_active BIT NOT NULL DEFAULT b'1',
  legacy_product_id INT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_products_sku (sku),
  UNIQUE KEY uk_products_legacy_product_id (legacy_product_id),
  KEY idx_products_sku (sku),
  CONSTRAINT chk_products_unit_price CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  stock_available INT NOT NULL DEFAULT 0,
  stock_reserved INT NOT NULL DEFAULT 0,
  warehouse_location VARCHAR(255) NULL,
  reorder_point INT NOT NULL DEFAULT 0,
  legacy_inventory_id INT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_inventory_product_id (product_id),
  UNIQUE KEY uk_inventory_legacy_inventory_id (legacy_inventory_id),
  KEY idx_inventory_product_id (product_id),
  CONSTRAINT fk_inventory_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_inventory_stock_available CHECK (stock_available >= 0),
  CONSTRAINT chk_inventory_stock_reserved CHECK (stock_reserved >= 0),
  CONSTRAINT chk_inventory_reorder_point CHECK (reorder_point >= 0),
  CONSTRAINT chk_inventory_reserved_available CHECK (stock_reserved <= stock_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
