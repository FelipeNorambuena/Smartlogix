package com.api.inventario.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.api.inventario.dto.InventoryResponse;
import com.api.inventario.dto.InventoryUpdateRequest;
import com.api.inventario.dto.StockResponse;
import com.api.inventario.exception.BusinessRuleException;
import com.api.inventario.exception.ResourceNotFoundException;
import com.api.inventario.model.Inventory;
import com.api.inventario.model.Product;
import com.api.inventario.repository.InventoryRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * Pruebas unitarias de InventoryService.
 * Validan reglas de stock y relacion producto-inventario sin conectarse a MySQL.
 */
@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void updateByProductIdStoresAbsoluteValues() {
        // Verifica que el update guarde los valores recibidos como cantidades absolutas.
        UUID productId = UUID.randomUUID();
        Product product = product(productId);
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        InventoryUpdateRequest request = new InventoryUpdateRequest(20, 5, "Santiago", 3);

        when(productService.findEntityById(productId)).thenReturn(product);
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InventoryResponse response = inventoryService.updateByProductId(productId, request);

        assertThat(response.stockAvailable()).isEqualTo(20);
        assertThat(response.stockReserved()).isEqualTo(5);
        assertThat(response.warehouseLocation()).isEqualTo("Santiago");
        assertThat(response.reorderPoint()).isEqualTo(3);
    }

    @Test
    void updateByProductIdCreatesInventoryWhenMissing() {
        // Si el producto existe pero no tiene inventario, el service crea la fila.
        UUID productId = UUID.randomUUID();
        Product product = product(productId);
        InventoryUpdateRequest request = new InventoryUpdateRequest(12, 2, "Valparaiso", 4);

        when(productService.findEntityById(productId)).thenReturn(product);
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InventoryResponse response = inventoryService.updateByProductId(productId, request);

        assertThat(response.productId()).isEqualTo(productId);
        assertThat(response.stockAvailable()).isEqualTo(12);
        assertThat(response.stockReserved()).isEqualTo(2);
        assertThat(response.warehouseLocation()).isEqualTo("Valparaiso");
    }

    @Test
    void updateByProductIdRejectsReservedGreaterThanAvailable() {
        // Regla principal de consistencia: no se puede reservar mas de lo disponible.
        UUID productId = UUID.randomUUID();
        InventoryUpdateRequest request = new InventoryUpdateRequest(10, 11, "Santiago", 3);

        assertThatThrownBy(() -> inventoryService.updateByProductId(productId, request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("stock reservado no puede superar");
    }

    @Test
    void findStockByProductIdCalculatesFreeStockAndReorderStatus() {
        // Verifica calculo de stock libre y alerta de reposicion.
        UUID productId = UUID.randomUUID();
        Product product = product(productId);
        Inventory inventory = inventory(product, 8, 3, 8);

        when(productService.findEntityById(productId)).thenReturn(product);
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.of(inventory));

        StockResponse response = inventoryService.findStockByProductId(productId);

        assertThat(response.stockFree()).isEqualTo(5);
        assertThat(response.belowReorderPoint()).isTrue();
    }

    @Test
    void findStockByProductIdRejectsMissingInventory() {
        // Diferencia producto existente de inventario aun no creado.
        UUID productId = UUID.randomUUID();
        Product product = product(productId);

        when(productService.findEntityById(productId)).thenReturn(product);
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventoryService.findStockByProductId(productId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Inventario no encontrado para producto " + productId);
    }

    private Inventory inventory(Product product, int stockAvailable, int stockReserved, int reorderPoint) {
        // Helper para construir una entidad de inventario reutilizable en pruebas.
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setStockAvailable(stockAvailable);
        inventory.setStockReserved(stockReserved);
        inventory.setWarehouseLocation("Santiago");
        inventory.setReorderPoint(reorderPoint);
        return inventory;
    }

    private Product product(UUID productId) {
        // Helper minimo de producto; solo incluye campos usados por DTOs de inventario.
        Product product = new Product();
        product.setId(productId);
        product.setSku("SLX-001");
        product.setName("Producto test");
        return product;
    }
}
