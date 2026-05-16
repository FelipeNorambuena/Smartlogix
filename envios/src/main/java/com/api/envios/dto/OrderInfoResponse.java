package com.api.envios.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/*
 * DTO local para leer pedidos desde pedidos-service sin compartir entidades.
 */
public record OrderInfoResponse(
        UUID id,
        UUID customerId,
        String status,
        String shippingAddress,
        BigDecimal totalAmount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
