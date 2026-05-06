package com.api.inventario.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.api.inventario.dto.InventoryResponse;
import com.api.inventario.dto.InventoryUpdateRequest;
import com.api.inventario.dto.StockResponse;
import com.api.inventario.service.InventoryService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private InventoryService inventoryService;

    @Test
    void getStockReturnsAvailability() throws Exception {
        UUID productId = UUID.randomUUID();
        StockResponse response = new StockResponse(
                productId,
                "SLX-001",
                "Producto test",
                20,
                5,
                15,
                "Santiago",
                false);
        when(inventoryService.findStockByProductId(productId)).thenReturn(response);

        mockMvc.perform(get("/api/inventory/{productId}/stock", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockFree").value(15));
    }

    @Test
    void updateInventoryReturnsUpdatedValues() throws Exception {
        UUID productId = UUID.randomUUID();
        UUID inventoryId = UUID.randomUUID();
        InventoryUpdateRequest request = new InventoryUpdateRequest(20, 5, "Santiago", 3);
        InventoryResponse response = new InventoryResponse(
                inventoryId,
                productId,
                "SLX-001",
                "Producto test",
                20,
                5,
                "Santiago",
                3,
                null,
                null);
        when(inventoryService.updateByProductId(eq(productId), any(InventoryUpdateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/inventory/{productId}", productId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockAvailable").value(20))
                .andExpect(jsonPath("$.stockReserved").value(5));
    }

    @Test
    void updateInventoryRejectsInvalidPayload() throws Exception {
        UUID productId = UUID.randomUUID();
        String payload = """
                {
                  "stockAvailable": -1,
                  "stockReserved": 0,
                  "warehouseLocation": "Santiago",
                  "reorderPoint": 0
                }
                """;

        mockMvc.perform(put("/api/inventory/{productId}", productId)
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La solicitud contiene datos invalidos"));
    }
}
