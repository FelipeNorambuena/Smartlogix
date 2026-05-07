package com.api.inventario.repository;

import com.api.inventario.model.Inventory;
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
 * Repositorio JPA para inventario.
 * El inventario se consulta por productId porque la API opera desde el producto.
 */
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    // Obtiene la fila de inventario asociada a un producto.
    Optional<Inventory> findByProductId(UUID productId);

    // Bloquea la fila durante operaciones transaccionales para evitar sobre-reservas.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Inventory i join fetch i.product where i.product.id = :productId")
    Optional<Inventory> findByProductIdForUpdate(@Param("productId") UUID productId);

    // Lista inventario con datos de producto, filtros opcionales y paginacion.
    @Query(
            value = """
                    select i
                    from Inventory i
                    join fetch i.product p
                    where (:sku is null or upper(p.sku) like upper(concat('%', :sku, '%')))
                      and (:warehouseLocation is null
                           or upper(i.warehouseLocation) like upper(concat('%', :warehouseLocation, '%')))
                      and (:lowStock is null
                           or (:lowStock = true and i.stockAvailable <= i.reorderPoint)
                           or (:lowStock = false and i.stockAvailable > i.reorderPoint))
                    """,
            countQuery = """
                    select count(i)
                    from Inventory i
                    join i.product p
                    where (:sku is null or upper(p.sku) like upper(concat('%', :sku, '%')))
                      and (:warehouseLocation is null
                           or upper(i.warehouseLocation) like upper(concat('%', :warehouseLocation, '%')))
                      and (:lowStock is null
                           or (:lowStock = true and i.stockAvailable <= i.reorderPoint)
                           or (:lowStock = false and i.stockAvailable > i.reorderPoint))
                    """)
    Page<Inventory> search(
            @Param("sku") String sku,
            @Param("warehouseLocation") String warehouseLocation,
            @Param("lowStock") Boolean lowStock,
            Pageable pageable);

    // Permite validar existencia sin cargar toda la entidad.
    boolean existsByProductId(UUID productId);
}
