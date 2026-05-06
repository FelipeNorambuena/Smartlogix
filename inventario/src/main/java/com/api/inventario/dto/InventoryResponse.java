package com.api.inventario.dto;

import com.api.inventario.model.Inventory;
import java.time.OffsetDateTime;
import java.util.UUID;

/*
 * Respuesta detallada de inventario.
 * Incluye datos basicos del producto para que el cliente no deba hacer
 * una segunda llamada solo para mostrar SKU y nombre.
 */
public record InventoryResponse(
        UUID id,
        UUID productId,
        String sku,
        String productName,
        int stockAvailable,
        int stockReserved,
        String warehouseLocation,
        int reorderPoint,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {

    public static InventoryResponse from(Inventory inventory) {
        // Mapper centralizado de entidad a DTO.
        return new InventoryResponse(
                inventory.getId(),
                inventory.getProduct().getId(),
                inventory.getProduct().getSku(),
                inventory.getProduct().getName(),
                inventory.getStockAvailable(),
                inventory.getStockReserved(),
                inventory.getWarehouseLocation(),
                inventory.getReorderPoint(),
                inventory.getCreatedAt(),
                inventory.getUpdatedAt());
    }
}
