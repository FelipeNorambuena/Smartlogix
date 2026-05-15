package com.api.pedidos.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/*
 * Contrato minimo consumido desde inventory-service.
 * Debe mantenerse alineado con ProductResponse de inventario sin compartir clases entre servicios.
 */
public record ProductInfoResponse(
        UUID id,
        String sku,
        String name,
        String description,
        BigDecimal unitPrice,
        String category,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
