package com.api.inventario.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.api.inventario.dto.ProductCreateRequest;
import com.api.inventario.exception.BusinessRuleException;
import com.api.inventario.model.Product;
import com.api.inventario.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void createStoresValidProduct() {
        ProductCreateRequest request = new ProductCreateRequest(
                " slx-999 ",
                "Producto test",
                "Descripcion",
                BigDecimal.valueOf(12990),
                "Categoria");
        when(productRepository.existsBySku("SLX-999")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        productService.create(request);

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        Product product = productCaptor.getValue();
        assertThat(product.getSku()).isEqualTo("SLX-999");
        assertThat(product.getName()).isEqualTo("Producto test");
        assertThat(product.isActive()).isTrue();
    }

    @Test
    void createRejectsDuplicatedSku() {
        ProductCreateRequest request = new ProductCreateRequest(
                "SLX-001",
                "Producto test",
                null,
                BigDecimal.TEN,
                null);
        when(productRepository.existsBySku("SLX-001")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Ya existe un producto con SKU SLX-001");
    }

    @Test
    void softDeleteMarksProductInactive() {
        UUID productId = UUID.randomUUID();
        Product product = new Product();
        product.setId(productId);
        product.setActive(true);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        productService.softDelete(productId);

        assertThat(product.isActive()).isFalse();
        verify(productRepository).save(product);
    }
}
