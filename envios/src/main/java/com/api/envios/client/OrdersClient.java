package com.api.envios.client;

import com.api.envios.dto.OrderInfoResponse;
import com.api.envios.exception.BusinessRuleException;
import com.api.envios.exception.ExternalServiceUnavailableException;
import com.api.envios.exception.ResourceNotFoundException;
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
public class OrdersClient {

    /*
     * Cliente REST hacia pedidos-service.
     * Envios solo consulta el pedido para validar que exista y este listo para despacho.
     */
    private final RestClient ordersRestClient;
    private final CircuitBreaker ordersCircuitBreaker;
    private final String apiKey;
    private final String apiKeyHeaderName;
    private final String serviceUserId;
    private final String serviceRoles;

    public OrdersClient(
            RestClient ordersRestClient,
            CircuitBreaker ordersCircuitBreaker,
            @Value("${shipping.orders-api-key:}") String apiKey,
            @Value("${shipping.orders-api-key-header:X-API-Key}") String apiKeyHeaderName,
            @Value("${shipping.orders-service-user-id}") String serviceUserId,
            @Value("${shipping.orders-service-roles:ADMIN}") String serviceRoles) {
        this.ordersRestClient = ordersRestClient;
        this.ordersCircuitBreaker = ordersCircuitBreaker;
        this.apiKey = apiKey;
        this.apiKeyHeaderName = apiKeyHeaderName;
        this.serviceUserId = serviceUserId;
        this.serviceRoles = serviceRoles;
    }

    public OrderInfoResponse findOrderById(UUID orderId) {
        return execute("consultar pedido " + orderId, () -> ordersRestClient.get()
                .uri("/api/orders/{id}", orderId)
                .headers(this::addInternalHeaders)
                .retrieve()
                .body(OrderInfoResponse.class));
    }

    private <T> T execute(String operation, Supplier<T> supplier) {
        try {
            return ordersCircuitBreaker.executeSupplier(supplier);
        } catch (CallNotPermittedException exception) {
            throw new ExternalServiceUnavailableException(
                    "Pedidos-service no esta disponible para " + operation, exception);
        } catch (RestClientResponseException exception) {
            throw mapHttpException(operation, exception);
        } catch (ResourceAccessException exception) {
            throw new ExternalServiceUnavailableException(
                    "No fue posible conectar con pedidos-service para " + operation, exception);
        }
    }

    private RuntimeException mapHttpException(String operation, RestClientResponseException exception) {
        int status = exception.getStatusCode().value();
        if (status == 404) {
            return new ResourceNotFoundException("Pedidos-service no encontro el recurso al " + operation);
        }
        if (status == 400 || status == 409) {
            return new BusinessRuleException("Pedidos-service rechazo la solicitud: " + operation);
        }
        if (exception.getStatusCode().is5xxServerError()) {
            return new ExternalServiceUnavailableException(
                    "Pedidos-service fallo al " + operation, exception);
        }
        return new ExternalServiceUnavailableException(
                "Respuesta inesperada de pedidos-service al " + operation, exception);
    }

    private void addInternalHeaders(HttpHeaders headers) {
        if (apiKey != null && !apiKey.isBlank()) {
            headers.set(apiKeyHeaderName, apiKey);
        }
        headers.set("X-User-Id", serviceUserId);
        headers.set("X-User-Roles", serviceRoles);
    }
}
