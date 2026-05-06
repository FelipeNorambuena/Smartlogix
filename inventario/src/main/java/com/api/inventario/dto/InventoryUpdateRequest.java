package com.api.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/*
 * Body usado para crear o actualizar el inventario de un producto.
 * Los valores representan cantidades absolutas, no incrementos.
 */
public record InventoryUpdateRequest(
        // Stock total disponible; no puede ser null ni negativo.
        @NotNull @Min(0) Integer stockAvailable,
        // Cantidad reservada; el service valida que no supere el disponible.
        @NotNull @Min(0) Integer stockReserved,
        // Ubicacion opcional de bodega.
        String warehouseLocation,
        // Punto de reposicion; no puede ser null ni negativo.
        @NotNull @Min(0) Integer reorderPoint) {
}
