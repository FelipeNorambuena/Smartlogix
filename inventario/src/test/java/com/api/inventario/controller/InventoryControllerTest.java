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
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

/*
 * Pruebas web del InventoryController.
 * Usan MockMvc para verificar rutas, codigos HTTP y JSON sin depender de MySQL.
 */
@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private InventoryService inventoryService;

    @Test
    void findAllReturnsInventoryRows() throws Exception {
        // Verifica que GET /api/inventory responda una lista con stock por producto.
        UUID productId = UUID.randomUUID();
        UUID inventoryId = UUID.randomUUID();
        InventoryResponse response = inventoryResponse(inventoryId, productId);
        when(inventoryService.findAll()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(inventoryId.toString()))
                .andExpect(jsonPath("$[0].productId").value(productId.toString()))
                .andExpect(jsonPath("$[0].stockAvailable").value(20));
    }

    @Test
    void findInventoryByProductIdReturnsInventory() throws Exception {
        // Verifica consulta detallada de inventario usando el id del producto.
        UUID productId = UUID.randomUUID();
        UUID inventoryId = UUID.randomUUID();
        InventoryResponse response = inventoryResponse(inventoryId, productId);
        when(inventoryService.findByProductId(productId)).thenReturn(response);

        mockMvc.perform(get("/api/inventory/{productId}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(inventoryId.toString()))
                .andExpect(jsonPath("$.productId").value(productId.toString()));
    }

    @Test
    void getStockReturnsAvailability() throws Exception {
        // Verifica la vista resumida de disponibilidad: stock libre y reposicion.
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
        // Verifica que el update use valores absolutos de stock, no incrementos.
        UUID productId = UUID.randomUUID();
        UUID inventoryId = UUID.randomUUID();
        InventoryUpdateRequest request = new InventoryUpdateRequest(20, 5, "Santiago", 3);
        InventoryResponse response = inventoryResponse(inventoryId, productId);
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
        // Verifica validaciones de DTO para evitar stock negativo en la API.
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

    private InventoryResponse inventoryResponse(UUID inventoryId, UUID productId) {
        // Helper para crear respuestas consistentes en las pruebas del controller.
        return new InventoryResponse(
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
    }
}
