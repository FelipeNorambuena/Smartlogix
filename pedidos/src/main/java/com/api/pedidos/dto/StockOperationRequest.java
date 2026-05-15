package com.api.pedidos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/*
 * Body compartido por contrato HTTP para reservar, liberar o confirmar stock.
 */
public record StockOperationRequest(
        @NotNull @Min(1) Integer quantity) {
}
