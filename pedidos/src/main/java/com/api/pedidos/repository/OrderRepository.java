package com.api.pedidos.repository;

import com.api.pedidos.model.Order;
import com.api.pedidos.model.OrderStatus;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /*
     * Busqueda paginada para operacion.
     * Los filtros nulos permiten reutilizar el mismo metodo para ADMIN/OPERADOR y CLIENTE.
     */
    @Query("""
            select o
            from Order o
            where (:customerId is null or o.customerId = :customerId)
              and (:status is null or o.status = :status)
            """)
    Page<Order> search(
            @Param("customerId") UUID customerId,
            @Param("status") OrderStatus status,
            Pageable pageable);

    Page<Order> findByCustomerId(UUID customerId, Pageable pageable);

    /*
     * Bloquea la orden al cambiar estado para evitar transiciones simultaneas.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") UUID id);
}
