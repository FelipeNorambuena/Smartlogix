package com.api.inventario.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.api.inventario.dto.ProductCreateRequest;
import com.api.inventario.dto.ProductResponse;
import com.api.inventario.exception.ResourceNotFoundException;
import com.api.inventario.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProductService productService;

    @Test
    void getProductReturnsNotFound() throws Exception {
        UUID productId = UUID.randomUUID();
        when(productService.findById(productId))
                .thenThrow(new ResourceNotFoundException("Producto no encontrado con id " + productId));

        mockMvc.perform(get("/api/products/{id}", productId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Producto no encontrado con id " + productId));
    }

    @Test
    void createProductReturnsCreated() throws Exception {
        UUID productId = UUID.randomUUID();
        ProductCreateRequest request = new ProductCreateRequest(
                "SLX-999",
                "Producto test",
                null,
                BigDecimal.valueOf(12990),
                "Categoria");
        ProductResponse response = new ProductResponse(
                productId,
                "SLX-999",
                "Producto test",
                null,
                BigDecimal.valueOf(12990),
                "Categoria",
                true,
                null,
                null);
        when(productService.create(any(ProductCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/products")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(productId.toString()))
                .andExpect(jsonPath("$.sku").value("SLX-999"));
    }
}
