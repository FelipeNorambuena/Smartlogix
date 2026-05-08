package com.api.pedidos.model;

/**
 * Define los posibles estados de un pedido.
 */
public enum OrderStatus {
    PENDING,       // Pedido creado, pendiente de confirmacion de stock y pago.
    CONFIRMED,     // Stock reservado y pago confirmado.
    SHIPPED,       // Pedido enviado al cliente.
    DELIVERED,     // Pedido entregado.
    CANCELLED,     // Pedido cancelado.
    PAYMENT_FAILED // Fallo en el pago.
}