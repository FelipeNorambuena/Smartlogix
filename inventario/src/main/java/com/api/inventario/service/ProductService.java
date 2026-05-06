package com.api.inventario.service;

import com.api.inventario.dto.ProductCreateRequest;
import com.api.inventario.dto.ProductResponse;
import com.api.inventario.dto.ProductUpdateRequest;
import com.api.inventario.exception.BusinessRuleException;
import com.api.inventario.exception.ResourceNotFoundException;
import com.api.inventario.model.Product;
import com.api.inventario.repository.ProductRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProductService {

    /*
     * Service de productos.
     * Centraliza reglas de negocio: normalizacion de SKU, validacion de
     * duplicados, busquedas y baja logica.
     */
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive() {
        // La API solo muestra productos activos para respetar la baja logica.
        return productRepository.findByActiveTrue().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(UUID id) {
        // Reutiliza la busqueda de entidad para mantener el mismo mensaje de error.
        return ProductResponse.from(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public ProductResponse findBySku(String sku) {
        // Normalizar el SKU evita diferencias por minusculas o espacios.
        String normalizedSku = normalizeSku(sku);
        return ProductResponse.from(productRepository.findBySku(normalizedSku)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado para SKU " + normalizedSku)));
    }

    public ProductResponse create(ProductCreateRequest request) {
        // El SKU es unico: no se permite crear dos productos con el mismo codigo.
        String sku = normalizeSku(request.sku());
        if (productRepository.existsBySku(sku)) {
            throw new BusinessRuleException("Ya existe un producto con SKU " + sku);
        }

        // Se construye la entidad desde el DTO para no exponer el modelo JPA en la API.
        Product product = new Product();
        product.setSku(sku);
        product.setName(request.name().trim());
        product.setDescription(trimToNull(request.description()));
        product.setUnitPrice(request.unitPrice());
        product.setCategory(trimToNull(request.category()));
        product.setActive(true);

        return ProductResponse.from(productRepository.save(product));
    }

    public ProductResponse update(UUID id, ProductUpdateRequest request) {
        // Primero se valida que el producto exista; si no, se informa 404.
        Product product = findEntityById(id);
        String sku = normalizeSku(request.sku());
        if (productRepository.existsBySkuAndIdNot(sku, id)) {
            throw new BusinessRuleException("Ya existe un producto con SKU " + sku);
        }

        product.setSku(sku);
        product.setName(request.name().trim());
        product.setDescription(trimToNull(request.description()));
        product.setUnitPrice(request.unitPrice());
        product.setCategory(trimToNull(request.category()));
        // active es opcional en update para permitir ediciones sin cambiar el estado.
        if (request.active() != null) {
            product.setActive(request.active());
        }

        return ProductResponse.from(productRepository.save(product));
    }

    public void softDelete(UUID id) {
        // Se conserva el registro para historico y relaciones existentes.
        Product product = findEntityById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    Product findEntityById(UUID id) {
        // Metodo package-private para que InventoryService pueda validar productos.
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id " + id));
    }

    private String normalizeSku(String sku) {
        // Regla simple: SKU sin espacios externos y siempre en mayusculas.
        return sku.trim().toUpperCase();
    }

    private String trimToNull(String value) {
        // Guarda null en campos opcionales vacios para evitar strings sin contenido.
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
