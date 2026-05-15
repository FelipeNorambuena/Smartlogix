-- SmartLogix pedidos database bootstrap for Laragon MySQL/MariaDB.
-- Run this script from HeidiSQL before starting pedidos-service.
--
-- Default connection used by pedidos:
-- jdbc:mysql://localhost:3306/smartlogix_orders?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
--
-- This script creates the database and the same tables defined by:
-- pedidos/src/main/resources/db/migration/V1__create_orders_schema.sql

CREATE DATABASE IF NOT EXISTS smartlogix_orders
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartlogix_orders;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL,
  shipping_address VARCHAR(500) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_orders_customer_id (customer_id),
  KEY idx_orders_status (status),
  CONSTRAINT chk_orders_status CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED')),
  CONSTRAINT chk_orders_total_amount CHECK (total_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  sku VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  KEY idx_order_items_sku (sku),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification queries.
SELECT SCHEMA_NAME AS database_name
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'smartlogix_orders';

SELECT TABLE_NAME AS table_name
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'smartlogix_orders'
  AND TABLE_NAME IN ('orders', 'order_items')
ORDER BY TABLE_NAME;
