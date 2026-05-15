package com.api.pedidos.dto;

import jakarta.validation.constraints.NotBlank;

/*
 * Body para cambios de estado.
 * Se usa String para aceptar valores en minusculas o mayusculas desde clientes HTTP.
 */
public record OrderStatusUpdateRequest(
        @NotBlank String status
) {
}
