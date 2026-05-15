package com.api.pedidos.client;

import com.api.pedidos.dto.ProductInfoResponse;
import com.api.pedidos.dto.StockAvailabilityResponse;
import com.api.pedidos.dto.StockOperationRequest;
import com.api.pedidos.exception.BusinessRuleException;
import com.api.pedidos.exception.ExternalServiceUnavailableException;
import com.api.pedidos.exception.InsufficientStockException;
import com.api.pedidos.exception.ResourceNotFoundException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class InventoryClient {

    /*
     * Cliente REST declarativo simple hacia inventory-service.
     * No comparte entidades ni repositories; solo consume contratos HTTP DTO.
     */
    private final RestClient inventoryRestClient;
    private final CircuitBreaker inventoryCircuitBreaker;
    private final String apiKey;
    private final String apiKeyHeaderName;

    public InventoryClient(
            RestClient inventoryRestClient,
            CircuitBreaker inventoryCircuitBreaker,
            @Value("${orders.inventory-api-key:}") String apiKey,
            @Value("${orders.inventory-api-key-header:X-API-Key}") String apiKeyHeaderName) {
        this.inventoryRestClient = inventoryRestClient;
        this.inventoryCircuitBreaker = inventoryCircuitBreaker;
        this.apiKey = apiKey;
        this.apiKeyHeaderName = apiKeyHeaderName;
    }

    public ProductInfoResponse findProductBySku(String sku) {
        return execute("consultar producto " + sku, () -> inventoryRestClient.get()
                .uri("/api/products/sku/{sku}", sku)
                .headers(this::addInternalHeaders)
                .retrieve()
                .body(ProductInfoResponse.class));
    }

    public StockAvailabilityResponse checkAvailability(UUID productId, int quantity) {
        return execute("validar disponibilidad de stock", () -> inventoryRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/inventory/{productId}/availability")
                        .queryParam("quantity", quantity)
                        .build(productId))
                .headers(this::addInternalHeaders)
                .retrieve()
                .body(StockAvailabilityResponse.class));
    }

    public void reserveStock(UUID productId, int quantity) {
        execute("reservar stock", () -> {
            inventoryRestClient.post()
                    .uri("/api/inventory/{productId}/reserve", productId)
                    .headers(this::addInternalHeaders)
                    .body(new StockOperationRequest(quantity))
                    .retrieve()
                    .toBodilessEntity();
            return null;
        });
    }

    public void releaseReservedStock(UUID productId, int quantity) {
        execute("liberar stock reservado", () -> {
            inventoryRestClient.post()
                    .uri("/api/inventory/{productId}/release", productId)
                    .headers(this::addInternalHeaders)
                    .body(new StockOperationRequest(quantity))
                    .retrieve()
                    .toBodilessEntity();
            return null;
        });
    }

    public void confirmReservedStock(UUID productId, int quantity) {
        execute("confirmar stock reservado", () -> {
            inventoryRestClient.post()
                    .uri("/api/inventory/{productId}/confirm", productId)
                    .headers(this::addInternalHeaders)
                    .body(new StockOperationRequest(quantity))
                    .retrieve()
                    .toBodilessEntity();
            return null;
        });
    }

    private <T> T execute(String operation, Supplier<T> supplier) {
        try {
            return inventoryCircuitBreaker.executeSupplier(supplier);
        } catch (CallNotPermittedException exception) {
            throw new ExternalServiceUnavailableException(
                    "Inventory-service no esta disponible para " + operation, exception);
        } catch (RestClientResponseException exception) {
            throw mapHttpException(operation, exception);
        } catch (ResourceAccessException exception) {
            throw new ExternalServiceUnavailableException(
                    "No fue posible conectar con inventory-service para " + operation, exception);
        }
    }

    private RuntimeException mapHttpException(String operation, RestClientResponseException exception) {
        int status = exception.getStatusCode().value();
        if (status == 404) {
            return new ResourceNotFoundException("Inventory-service no encontro el recurso al " + operation);
        }
        if (status == 409 || status == 400) {
            if (operation.contains("stock")) {
                return new InsufficientStockException("Inventory-service rechazo la operacion de stock");
            }
            return new BusinessRuleException("Inventory-service rechazo la solicitud: " + operation);
        }
        if (exception.getStatusCode().is5xxServerError()) {
            return new ExternalServiceUnavailableException(
                    "Inventory-service fallo al " + operation, exception);
        }
        return new ExternalServiceUnavailableException(
                "Respuesta inesperada de inventory-service al " + operation, exception);
    }

    private void addInternalHeaders(HttpHeaders headers) {
        if (apiKey != null && !apiKey.isBlank()) {
            headers.set(apiKeyHeaderName, apiKey);
        }
    }
}
