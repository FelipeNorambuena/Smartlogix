package com.api.pedidos.dto;

import com.api.pedidos.model.Order;
import com.api.pedidos.model.OrderItem;
import com.api.pedidos.model.OrderStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

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

record OrderItemResponse(
        UUID id,
        String sku,
        String productName,
        int quantity,
        BigDecimal unitPrice
) {
    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(item.getId(), item.getSku(), item.getProductName(), item.getQuantity(), item.getUnitPrice());
    }
}