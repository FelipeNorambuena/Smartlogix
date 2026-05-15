package com.api.pedidos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/*
 * Item solicitado para un pedido.
 * El producto se identifica por SKU para desacoplar al frontend del UUID interno de inventario.
 */
public record OrderItemRequest(
        @NotBlank @Size(max = 255) String sku,
        @NotNull @Min(1) Integer quantity
) {
}
