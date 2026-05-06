package com.api.inventario.repository;

import com.api.inventario.model.Product;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/*
 * Repositorio JPA para productos.
 * Spring Data implementa automaticamente estos metodos a partir del nombre.
 */
public interface ProductRepository extends JpaRepository<Product, UUID> {

    // Verifica duplicados al crear un producto.
    boolean existsBySku(String sku);

    // Verifica duplicados al actualizar, ignorando el producto que se esta editando.
    boolean existsBySkuAndIdNot(String sku, UUID id);

    // Busca por SKU normalizado.
    Optional<Product> findBySku(String sku);

    // Lista solo productos visibles para la API publica.
    List<Product> findByActiveTrue();
}
