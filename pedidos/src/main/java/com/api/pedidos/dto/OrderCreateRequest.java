package com.api.pedidos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record OrderCreateRequest(
        @NotBlank String shippingAddress,
        @NotEmpty @Valid List<OrderItemRequest> items
) {
}