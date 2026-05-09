package com.api.inventario.repository;

import com.api.inventario.model.Product;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    // Entrega SKUs existentes para calcular el siguiente codigo automatico.
    @Query("select p.sku from Product p where p.sku like concat(:prefix, '%')")
    List<String> findSkusByPrefix(@Param("prefix") String prefix);

    // Lista productos activos con filtros opcionales y paginacion.
    @Query("""
            select p
            from Product p
            where p.active = true
              and (:sku is null or upper(p.sku) like upper(concat('%', :sku, '%')))
              and (:name is null or upper(p.name) like upper(concat('%', :name, '%')))
              and (:category is null or upper(p.category) like upper(concat('%', :category, '%')))
            """)
    Page<Product> searchActive(
            @Param("sku") String sku,
            @Param("name") String name,
            @Param("category") String category,
            Pageable pageable);
}
