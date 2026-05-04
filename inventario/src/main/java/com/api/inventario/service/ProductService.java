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

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive() {
        return productRepository.findByActiveTrue().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(UUID id) {
        return ProductResponse.from(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public ProductResponse findBySku(String sku) {
        return ProductResponse.from(productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado para SKU " + sku)));
    }

    public ProductResponse create(ProductCreateRequest request) {
        String sku = normalizeSku(request.sku());
        if (productRepository.existsBySku(sku)) {
            throw new BusinessRuleException("Ya existe un producto con SKU " + sku);
        }

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
        if (request.active() != null) {
            product.setActive(request.active());
        }

        return ProductResponse.from(productRepository.save(product));
    }

    public void softDelete(UUID id) {
        Product product = findEntityById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    Product findEntityById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id " + id));
    }

    private String normalizeSku(String sku) {
        return sku.trim().toUpperCase();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
