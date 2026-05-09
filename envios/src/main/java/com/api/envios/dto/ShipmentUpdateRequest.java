package com.api.envios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/*
 * Body usado para editar datos logisticos del envio.
 * No cambia el pedido ni el estado; esos flujos tienen endpoints propios.
 */
public record ShipmentUpdateRequest(
        // Direccion actualizada de entrega.
        @NotBlank @Size(max = 500) String shippingAddress,
        // Transportista asignado o reasignado.
        @Size(max = 255) String carrier,
        // Codigo de seguimiento visible para el cliente.
        @Size(max = 255) String trackingNumber) {
}
