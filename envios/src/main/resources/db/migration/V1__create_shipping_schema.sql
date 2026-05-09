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
