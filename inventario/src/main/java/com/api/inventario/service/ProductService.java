package com.api.inventario.service;

import com.api.inventario.dto.ProductCreateRequest;
import com.api.inventario.dto.PageResponse;
import com.api.inventario.dto.ProductResponse;
import com.api.inventario.dto.ProductSkuResponse;
import com.api.inventario.dto.ProductUpdateRequest;
import com.api.inventario.exception.BusinessRuleException;
import com.api.inventario.factory.SkuFactory;
import com.api.inventario.exception.ResourceNotFoundException;
import com.api.inventario.model.Product;
import com.api.inventario.repository.ProductRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    private static final String AUTO_SKU_PREFIX = "SKU-";

    private final ProductRepository productRepository;
    private final SkuFactory skuFactory;

    public ProductService(ProductRepository productRepository, SkuFactory skuFactory) {
        this.productRepository = productRepository;
        this.skuFactory = skuFactory;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive() {
        // La API solo muestra productos activos para respetar la baja logica.
        return productRepository.findByActiveTrue().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchActive(
            String sku,
            String name,
            String category,
            int page,
            int size) {
        // Listado publico paginado con filtros simples para busqueda operativa.
        PageRequest pageRequest = PageRequest.of(
                validatePage(page),
                validateSize(size),
                Sort.by("sku").ascending());
        return PageResponse.from(productRepository.searchActive(
                        trimToNull(sku),
                        trimToNull(name),
                        trimToNull(category),
                        pageRequest)
                .map(ProductResponse::from));
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

    @Transactional(readOnly = true)
    public ProductSkuResponse getNextSku() {
        // Expone al frontend el proximo codigo sugerido sin crear el producto.
        return new ProductSkuResponse(generateNextSku());
    }

    public ProductResponse create(ProductCreateRequest request) {
        // Si el frontend no envia SKU, el backend genera el siguiente codigo seguro.
        String sku = shouldGenerateSku(request.sku())
                ? generateNextSku()
                : normalizeSku(request.sku());
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

    private String generateNextSku() {
        return skuFactory.nextSku(AUTO_SKU_PREFIX, productRepository.findSkusByPrefix(AUTO_SKU_PREFIX));
    }

    private boolean shouldGenerateSku(String sku) {
        return sku == null || sku.trim().isEmpty();
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

    private int validatePage(int page) {
        if (page < 0) {
            throw new BusinessRuleException("La pagina no puede ser negativa");
        }
        return page;
    }

    private int validateSize(int size) {
        if (size < 1 || size > 100) {
            throw new BusinessRuleException("El tamano de pagina debe estar entre 1 y 100");
        }
        return size;
    }
}
