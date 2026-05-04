package com.api.inventario.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.api.inventario.dto.InventoryResponse;
import com.api.inventario.dto.InventoryUpdateRequest;
import com.api.inventario.exception.BusinessRuleException;
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
    void updateByProductIdRejectsReservedGreaterThanAvailable() {
        UUID productId = UUID.randomUUID();
        InventoryUpdateRequest request = new InventoryUpdateRequest(10, 11, "Santiago", 3);

        assertThatThrownBy(() -> inventoryService.updateByProductId(productId, request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("stock reservado no puede superar");
    }

    private Product product(UUID productId) {
        Product product = new Product();
        product.setId(productId);
        product.setSku("SLX-001");
        product.setName("Producto test");
        return product;
    }
}
