package com.api.envios.dto;

import com.api.envios.model.ShipmentEvent;
import java.time.OffsetDateTime;
import java.util.UUID;

/*
 * Respuesta de un evento de tracking.
 * Permite reconstruir la linea de tiempo del envio.
 */
public record ShipmentEventResponse(
        UUID id,
        UUID shipmentId,
        String status,
        String location,
        String description,
        OffsetDateTime occurredAt,
        OffsetDateTime createdAt) {

    public static ShipmentEventResponse from(ShipmentEvent event) {
        // Mapper centralizado de entidad a DTO.
        return new ShipmentEventResponse(
                event.getId(),
                event.getShipment().getId(),
                event.getStatus(),
                event.getLocation(),
                event.getDescription(),
                event.getOccurredAt(),
                event.getCreatedAt());
    }
}
