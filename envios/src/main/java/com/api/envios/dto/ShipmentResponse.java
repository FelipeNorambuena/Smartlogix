package com.api.envios.dto;

import com.api.envios.model.Shipment;
import java.time.OffsetDateTime;
import java.util.UUID;

/*
 * Respuesta principal de envios.
 * Expone datos logisticos sin filtrar detalles internos de la entidad JPA.
 */
public record ShipmentResponse(
        UUID id,
        UUID orderId,
        String status,
        String shippingAddress,
        String carrier,
        String trackingNumber,
        OffsetDateTime shippedAt,
        OffsetDateTime deliveredAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {

    public static ShipmentResponse from(Shipment shipment) {
        // Mapper centralizado de entidad a DTO.
        return new ShipmentResponse(
                shipment.getId(),
                shipment.getOrderId(),
                shipment.getStatus(),
                shipment.getShippingAddress(),
                shipment.getCarrier(),
                shipment.getTrackingNumber(),
                shipment.getShippedAt(),
                shipment.getDeliveredAt(),
                shipment.getCreatedAt(),
                shipment.getUpdatedAt());
    }
}
