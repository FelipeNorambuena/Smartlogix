package com.api.envios.repository;

import com.api.envios.model.ShipmentEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/*
 * Repositorio JPA para eventos de tracking.
 * Mantiene separado el historial para no recargar la entidad Shipment.
 */
public interface ShipmentEventRepository extends JpaRepository<ShipmentEvent, UUID> {

    // Lista la linea de tiempo del envio desde el evento mas reciente.
    List<ShipmentEvent> findByShipmentIdOrderByOccurredAtDescCreatedAtDesc(UUID shipmentId);
}
