package com.api.pedidos.dto;

import com.api.pedidos.model.OrderItem;
import java.math.BigDecimal;
import java.util.UUID;

/*
 * Respuesta publica de item de pedido con datos denormalizados del producto.
 */
public record OrderItemResponse(
        UUID id,
        UUID productId,
        String sku,
        String productName,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
    public static OrderItemResponse from(OrderItem item) {
        BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new OrderItemResponse(
                item.getId(),
                item.getProductId(),
                item.getSku(),
                item.getProductName(),
                item.getQuantity(),
                item.getUnitPrice(),
                lineTotal);
    }
}
