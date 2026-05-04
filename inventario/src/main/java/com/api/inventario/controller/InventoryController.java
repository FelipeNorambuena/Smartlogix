package com.api.inventario.controller;

import com.api.inventario.dto.InventoryResponse;
import com.api.inventario.dto.InventoryUpdateRequest;
import com.api.inventario.dto.StockResponse;
import com.api.inventario.service.InventoryService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryResponse> findAll() {
        return inventoryService.findAll();
    }

    @GetMapping("/{productId}")
    public InventoryResponse findByProductId(@PathVariable UUID productId) {
        return inventoryService.findByProductId(productId);
    }

    @GetMapping("/{productId}/stock")
    public StockResponse findStockByProductId(@PathVariable UUID productId) {
        return inventoryService.findStockByProductId(productId);
    }

    @PutMapping("/{productId}")
    public InventoryResponse updateByProductId(
            @PathVariable UUID productId,
            @Valid @RequestBody InventoryUpdateRequest request) {
        return inventoryService.updateByProductId(productId, request);
    }
}
