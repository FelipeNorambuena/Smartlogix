package com.api.envios.repository;

import com.api.envios.model.Shipment;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/*
 * Repositorio JPA para envios.
 * Spring Data implementa busquedas simples y la query custom permite filtros.
 */
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    // Valida que un pedido no tenga mas de un envio asociado.
    boolean existsByOrderId(UUID orderId);

    // Verifica duplicados de tracking al crear o actualizar.
    boolean existsByTrackingNumber(String trackingNumber);

    // Verifica duplicados de tracking ignorando el envio que se esta editando.
    boolean existsByTrackingNumberAndIdNot(String trackingNumber, UUID id);

    // Busca el envio asociado a un pedido.
    Optional<Shipment> findByOrderId(UUID orderId);

    // Busca por codigo de tracking visible para cliente o soporte.
    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    // Bloquea la fila antes de cambios de estado para evitar transiciones simultaneas.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Shipment s where s.id = :id")
    Optional<Shipment> findByIdForUpdate(@Param("id") UUID id);

    // Lista envios con filtros opcionales y paginacion.
    @Query("""
            select s
            from Shipment s
            where (:orderId is null or s.orderId = :orderId)
              and (:status is null or s.status = :status)
              and (:carrier is null or upper(s.carrier) like upper(concat('%', :carrier, '%')))
              and (:trackingNumber is null or upper(s.trackingNumber) like upper(concat('%', :trackingNumber, '%')))
            """)
    Page<Shipment> search(
            @Param("orderId") UUID orderId,
            @Param("status") String status,
            @Param("carrier") String carrier,
            @Param("trackingNumber") String trackingNumber,
            Pageable pageable);
}
