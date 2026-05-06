package com.api.inventario.repository;

import com.api.inventario.model.Inventory;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/*
 * Repositorio JPA para inventario.
 * El inventario se consulta por productId porque la API opera desde el producto.
 */
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    // Obtiene la fila de inventario asociada a un producto.
    Optional<Inventory> findByProductId(UUID productId);

    // Permite validar existencia sin cargar toda la entidad.
    boolean existsByProductId(UUID productId);
}
