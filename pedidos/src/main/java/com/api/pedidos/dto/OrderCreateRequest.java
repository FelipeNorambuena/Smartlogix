package com.api.pedidos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/*
 * Body para crear pedidos desde el frontend.
 * El customerId no se recibe aqui: llega desde el JWT procesado por API Gateway.
 */
public record OrderCreateRequest(
        @NotBlank @Size(max = 500) String shippingAddress,
        @NotEmpty @Size(max = 100) @Valid List<OrderItemRequest> items
) {
}
