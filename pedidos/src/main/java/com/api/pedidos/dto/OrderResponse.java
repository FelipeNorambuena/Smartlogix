package com.api.pedidos.dto;

import com.api.pedidos.model.Order;
import com.api.pedidos.model.OrderStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/*
 * Respuesta publica de pedido.
 * Evita exponer entidades JPA y mantiene estable el contrato REST.
 */
public record OrderResponse(
        UUID id,
        UUID customerId,
        OrderStatus status,
        String shippingAddress,
        BigDecimal totalAmount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<OrderItemResponse> items
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCustomerId(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getItems().stream().map(OrderItemResponse::from).toList()
        );
    }
}
