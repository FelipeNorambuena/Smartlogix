package com.api.inventario.repository;

import com.api.inventario.model.Product;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, UUID id);

    Optional<Product> findBySku(String sku);

    List<Product> findByActiveTrue();
}
