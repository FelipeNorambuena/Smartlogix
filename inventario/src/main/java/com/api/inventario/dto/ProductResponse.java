package com.api.inventario.dto;

import com.api.inventario.model.Product;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/*
 * Respuesta publica de producto.
 * Evita devolver directamente la entidad JPA y deja estable el contrato HTTP.
 */
public record ProductResponse(
        UUID id,
        String sku,
        String name,
        String description,
        BigDecimal unitPrice,
        String category,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {

    public static ProductResponse from(Product product) {
        // Mapper centralizado de entidad a DTO para evitar duplicar conversiones.
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getUnitPrice(),
                product.getCategory(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
