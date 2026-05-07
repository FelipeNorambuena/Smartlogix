package com.api.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/*
 * Body comun para operaciones transaccionales de stock.
 * La cantidad representa unidades a reservar, liberar o confirmar.
 */
public record StockOperationRequest(
        @NotNull @Min(1) Integer quantity) {
}

