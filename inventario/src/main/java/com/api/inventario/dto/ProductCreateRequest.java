package com.api.inventario.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/*
 * Body esperado para crear productos desde la API.
 * Las anotaciones de validacion se ejecutan antes de entrar al service.
 */
public record ProductCreateRequest(
        // SKU opcional: si viene vacio, ProductService genera SKU-000001, etc.
        String sku,
        // Nombre requerido para que el producto pueda mostrarse correctamente.
        @NotBlank String name,
        // Texto opcional; el service lo normaliza a null si viene vacio.
        String description,
        // Precio requerido y no negativo.
        @NotNull @DecimalMin(value = "0.00") BigDecimal unitPrice,
        // Categoria opcional para agrupacion o filtros.
        String category) {
}
