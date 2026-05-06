package com.api.inventario.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/*
 * Body esperado para actualizar un producto.
 * Es similar al alta, pero incluye active para reactivar o desactivar.
 */
public record ProductUpdateRequest(
        // SKU requerido; si cambia, el service valida que no exista en otro producto.
        @NotBlank String sku,
        // Nombre requerido.
        @NotBlank String name,
        // Descripcion opcional.
        String description,
        // Precio requerido y no negativo.
        @NotNull @DecimalMin(value = "0.00") BigDecimal unitPrice,
        // Categoria opcional.
        String category,
        // Estado opcional: null significa "no cambiar el estado actual".
        Boolean active) {
}
