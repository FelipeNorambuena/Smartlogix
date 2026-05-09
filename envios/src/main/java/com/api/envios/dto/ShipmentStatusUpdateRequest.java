package com.api.envios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/*
 * Body usado para mover el envio entre estados y registrar un evento.
 */
public record ShipmentStatusUpdateRequest(
        // Nuevo estado del envio: pending, ready_to_ship, in_transit, delivered, etc.
        @NotBlank @Size(max = 30) String status,
        // Ubicacion opcional donde ocurrio el cambio.
        @Size(max = 255) String location,
        // Descripcion opcional del evento.
        @Size(max = 255) String description,
        // Fecha real del evento; si no viene, el service usa la fecha actual.
        OffsetDateTime occurredAt) {
}
