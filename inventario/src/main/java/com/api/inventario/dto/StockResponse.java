package com.api.inventario.dto;

import com.api.inventario.model.Inventory;
import java.util.UUID;

/*
 * Respuesta resumida para consultas de disponibilidad.
 * Separa stock disponible, reservado y libre para facilitar decisiones de venta.
 */
public record StockResponse(
        UUID productId,
        String sku,
        String productName,
        int stockAvailable,
        int stockReserved,
        int stockFree,
        String warehouseLocation,
        boolean belowReorderPoint) {

    public static StockResponse from(Inventory inventory) {
        // Stock libre corresponde a lo disponible menos lo ya reservado.
        int stockFree = inventory.getStockAvailable() - inventory.getStockReserved();
        return new StockResponse(
                inventory.getProduct().getId(),
                inventory.getProduct().getSku(),
                inventory.getProduct().getName(),
                inventory.getStockAvailable(),
                inventory.getStockReserved(),
                stockFree,
                inventory.getWarehouseLocation(),
                inventory.getStockAvailable() <= inventory.getReorderPoint());
    }
}
