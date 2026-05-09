package com.api.inventario.dto;

/*
 * Respuesta simple para mostrar el proximo SKU sugerido en el frontend.
 * Mantenerlo como DTO evita devolver strings sueltos desde el controller.
 */
public record ProductSkuResponse(String sku) {
}
