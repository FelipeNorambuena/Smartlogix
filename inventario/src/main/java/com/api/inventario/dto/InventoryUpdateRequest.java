package com.api.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryUpdateRequest(
        @NotNull @Min(0) Integer stockAvailable,
        @NotNull @Min(0) Integer stockReserved,
        String warehouseLocation,
        @NotNull @Min(0) Integer reorderPoint) {
}
