package com.api.pedidos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

/*
 * Body para crear pedidos desde el frontend.
 * CLIENTE crea para si mismo. ADMIN puede indicar customerId para asignar el pedido
 * a un usuario cliente validado contra auth-service.
 */
public record OrderCreateRequest(
        @NotBlank @Size(max = 500) String shippingAddress,
        @NotEmpty @Size(max = 100) @Valid List<OrderItemRequest> items,
        UUID customerId
) {
}
