package com.api.pedidos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record OrderItemRequest(
        @NotBlank String sku,
        @Min(1) int quantity
) {
}