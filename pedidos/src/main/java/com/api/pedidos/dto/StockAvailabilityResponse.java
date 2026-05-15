package com.api.pedidos.dto;

import java.util.UUID;

/*
 * Contrato minimo para validar disponibilidad contra inventory-service.
 */
public record StockAvailabilityResponse(
        UUID productId,
        String sku,
        String productName,
        int requestedQuantity,
        int stockAvailable,
        int stockReserved,
        int stockFree,
        String warehouseLocation,
        boolean productActive,
        boolean available) {
}
