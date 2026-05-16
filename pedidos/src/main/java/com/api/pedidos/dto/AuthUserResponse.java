package com.api.pedidos.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/*
 * DTO local para leer usuarios desde auth-service sin compartir clases entre microservicios.
 */
public record AuthUserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        boolean enabled,
        List<String> roles,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
