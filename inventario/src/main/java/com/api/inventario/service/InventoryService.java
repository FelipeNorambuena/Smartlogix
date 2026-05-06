package com.api.inventario.service;

import com.api.inventario.dto.InventoryResponse;
import com.api.inventario.dto.InventoryUpdateRequest;
import com.api.inventario.dto.StockResponse;
import com.api.inventario.exception.BusinessRuleException;
import com.api.inventario.exception.ResourceNotFoundException;
import com.api.inventario.model.Inventory;
import com.api.inventario.model.Product;
import com.api.inventario.repository.InventoryRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductService productService;

    public InventoryService(InventoryRepository inventoryRepository, ProductService productService) {
        this.inventoryRepository = inventoryRepository;
        this.productService = productService;
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> findAll() {
        return inventoryRepository.findAll().stream()
                .map(InventoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryResponse findByProductId(UUID productId) {
        return InventoryResponse.from(findEntityByProductId(productId));
    }

    @Transactional(readOnly = true)
    public StockResponse findStockByProductId(UUID productId) {
        return StockResponse.from(findEntityByProductId(productId));
    }

    public InventoryResponse updateByProductId(UUID productId, InventoryUpdateRequest request) {
        validateStock(request.stockAvailable(), request.stockReserved(), request.reorderPoint());

        Product product = productService.findEntityById(productId);
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> {
                    Inventory created = new Inventory();
                    created.setProduct(product);
                    return created;
                });

        inventory.setStockAvailable(request.stockAvailable());
        inventory.setStockReserved(request.stockReserved());
        inventory.setWarehouseLocation(trimToNull(request.warehouseLocation()));
        inventory.setReorderPoint(request.reorderPoint());

        return InventoryResponse.from(inventoryRepository.save(inventory));
    }

    private Inventory findEntityByProductId(UUID productId) {
        productService.findEntityById(productId);
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventario no encontrado para producto " + productId));
    }

    private void validateStock(int stockAvailable, int stockReserved, int reorderPoint) {
        if (stockAvailable < 0) {
            throw new BusinessRuleException("El stock disponible no puede ser negativo");
        }
        if (stockReserved < 0) {
            throw new BusinessRuleException("El stock reservado no puede ser negativo");
        }
        if (reorderPoint < 0) {
            throw new BusinessRuleException("El punto de reposicion no puede ser negativo");
        }
        if (stockReserved > stockAvailable) {
            throw new BusinessRuleException("El stock reservado no puede superar el stock disponible");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
