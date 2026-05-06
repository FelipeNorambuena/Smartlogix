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

    /*
     * Controller HTTP para inventario.
     * Las rutas trabajan por productId porque el stock pertenece a un producto
     * unico y no se administra como recurso separado desde la API publica.
     */
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryResponse> findAll() {
        // Lista todas las filas de inventario junto con datos basicos del producto.
        return inventoryService.findAll();
    }

    @GetMapping("/{productId}")
    public InventoryResponse findByProductId(@PathVariable UUID productId) {
        // Recupera la ficha completa de inventario asociada a un producto.
        return inventoryService.findByProductId(productId);
    }

    @GetMapping("/{productId}/stock")
    public StockResponse findStockByProductId(@PathVariable UUID productId) {
        // Entrega una vista resumida enfocada en disponibilidad de stock.
        return inventoryService.findStockByProductId(productId);
    }

    @PutMapping("/{productId}")
    public InventoryResponse updateByProductId(
            @PathVariable UUID productId,
            @Valid @RequestBody InventoryUpdateRequest request) {
        // Crea o actualiza el inventario del producto con valores absolutos.
        return inventoryService.updateByProductId(productId, request);
    }
}
