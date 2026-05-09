package com.api.envios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/*
 * Body usado para crear un envio.
 * El envio nace asociado a un pedido y parte en estado pending.
 */
public record ShipmentCreateRequest(
        // Pedido dueño del envio; debe existir desde pedidos antes de despachar.
        @NotNull UUID orderId,
        // Direccion de entrega obligatoria.
        @NotBlank @Size(max = 500) String shippingAddress,
        // Transportista opcional asignado al despacho.
        @Size(max = 255) String carrier,
        // Codigo de tracking opcional y unico cuando se informa.
        @Size(max = 255) String trackingNumber) {
}
