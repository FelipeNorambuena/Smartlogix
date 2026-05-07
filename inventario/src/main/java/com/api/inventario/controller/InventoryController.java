package com.api.inventario.controller;

import com.api.inventario.dto.InventoryResponse;
import com.api.inventario.dto.InventoryUpdateRequest;
import com.api.inventario.dto.PageResponse;
import com.api.inventario.dto.StockAvailabilityResponse;
import com.api.inventario.dto.StockOperationRequest;
import com.api.inventario.dto.StockResponse;
import com.api.inventario.service.InventoryService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public PageResponse<InventoryResponse> findAll(
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) String warehouseLocation,
            @RequestParam(required = false) Boolean lowStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // Lista inventario con filtros y paginacion.
        return inventoryService.search(sku, warehouseLocation, lowStock, page, size);
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

    @GetMapping("/{productId}/availability")
    public StockAvailabilityResponse checkAvailability(
            @PathVariable UUID productId,
            @RequestParam Integer quantity) {
        // Permite a pedidos validar disponibilidad antes de reservar.
        return inventoryService.checkAvailability(productId, quantity);
    }

    @PutMapping("/{productId}")
    public InventoryResponse updateByProductId(
            @PathVariable UUID productId,
            @Valid @RequestBody InventoryUpdateRequest request) {
        // Crea o actualiza el inventario del producto con valores absolutos.
        return inventoryService.updateByProductId(productId, request);
    }

    @PostMapping("/{productId}/reserve")
    public StockResponse reserveStock(
            @PathVariable UUID productId,
            @Valid @RequestBody StockOperationRequest request) {
        // Aumenta stock reservado si existe stock libre suficiente.
        return inventoryService.reserveStock(productId, request.quantity());
    }

    @PostMapping("/{productId}/release")
    public StockResponse releaseReservedStock(
            @PathVariable UUID productId,
            @Valid @RequestBody StockOperationRequest request) {
        // Disminuye stock reservado sin alterar el stock total.
        return inventoryService.releaseReservedStock(productId, request.quantity());
    }

    @PostMapping("/{productId}/confirm")
    public StockResponse confirmReservedStock(
            @PathVariable UUID productId,
            @Valid @RequestBody StockOperationRequest request) {
        // Confirma una reserva y descuenta unidades del inventario total.
        return inventoryService.confirmReservedStock(productId, request.quantity());
    }
}
