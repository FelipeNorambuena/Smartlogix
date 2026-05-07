package com.api.inventario.dto;

import com.api.inventario.model.Inventory;
import java.util.UUID;

/*
 * Respuesta para verificar si existe stock libre suficiente para una cantidad.
 * Incluye el estado del producto para distinguir falta de stock de producto inactivo.
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

    public static StockAvailabilityResponse from(Inventory inventory, int requestedQuantity) {
        int stockFree = inventory.getStockAvailable() - inventory.getStockReserved();
        boolean productActive = inventory.getProduct().isActive();
        return new StockAvailabilityResponse(
                inventory.getProduct().getId(),
                inventory.getProduct().getSku(),
                inventory.getProduct().getName(),
                requestedQuantity,
                inventory.getStockAvailable(),
                inventory.getStockReserved(),
                stockFree,
                inventory.getWarehouseLocation(),
                productActive,
                productActive && requestedQuantity <= stockFree);
    }
}

