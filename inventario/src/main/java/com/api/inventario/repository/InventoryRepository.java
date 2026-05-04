package com.api.inventario.repository;

import com.api.inventario.model.Inventory;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Optional<Inventory> findByProductId(UUID productId);

    boolean existsByProductId(UUID productId);
}
