-- SmartLogix schema for Laragon MySQL/MariaDB.
-- Run this script from HeidiSQL before starting the Spring Boot services.

CREATE DATABASE IF NOT EXISTS smartlogix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartlogix;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL,
  auth_user_id VARCHAR(36) NULL,
  username VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  password_hash VARCHAR(255) NULL,
  full_name VARCHAR(255) NULL,
  rut VARCHAR(30) NULL,
  phone VARCHAR(30) NULL,
  default_address VARCHAR(500) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  legacy_user_id INT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_auth_user_id (auth_user_id),
  UNIQUE KEY uk_users_legacy_user_id (legacy_user_id),
  KEY idx_users_auth_user_id (auth_user_id),
  KEY idx_users_legacy_user_id (legacy_user_id),
  CONSTRAINT chk_users_status CHECK (status IN ('active', 'inactive', 'blocked'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_name (name),
  CONSTRAINT chk_roles_name CHECK (name IN ('cliente', 'trabajador_logistico', 'admin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, role_id),
  KEY idx_user_roles_user_id (user_id),
  KEY idx_user_roles_role_id (role_id),
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id) REFERENCES roles (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'CLP',
  shipping_address VARCHAR(500) NULL,
  legacy_sale_id INT NULL,
  placed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_orders_legacy_sale_id (legacy_sale_id),
  KEY idx_orders_user_id (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_orders_status CHECK (status IN ('pending', 'confirmed', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT chk_orders_total CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  legacy_order_item_id INT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_items_legacy_order_item_id (legacy_order_item_id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shipments (
  id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  shipping_address VARCHAR(500) NOT NULL,
  carrier VARCHAR(255) NULL,
  tracking_number VARCHAR(255) NULL,
  shipped_at DATETIME(6) NULL,
  delivered_at DATETIME(6) NULL,
  legacy_shipment_id INT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_shipments_order_id (order_id),
  UNIQUE KEY uk_shipments_tracking_number (tracking_number),
  UNIQUE KEY uk_shipments_legacy_shipment_id (legacy_shipment_id),
  KEY idx_shipments_order_id (order_id),
  CONSTRAINT fk_shipments_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_shipments_status CHECK (status IN ('pending', 'ready_to_ship', 'in_transit', 'delivered', 'failed', 'returned', 'cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shipment_events (
  id VARCHAR(36) NOT NULL,
  shipment_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL,
  location VARCHAR(255) NULL,
  description VARCHAR(255) NULL,
  occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_shipment_events_shipment_id (shipment_id),
  CONSTRAINT fk_shipment_events_shipment
    FOREIGN KEY (shipment_id) REFERENCES shipments (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(36) NOT NULL,
  code VARCHAR(255) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  valid_until DATE NULL,
  is_active BIT NOT NULL DEFAULT b'1',
  legacy_coupon_id INT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_coupons_code (code),
  UNIQUE KEY uk_coupons_legacy_coupon_id (legacy_coupon_id),
  CONSTRAINT chk_coupons_discount_percent CHECK (discount_percent > 0 AND discount_percent <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
