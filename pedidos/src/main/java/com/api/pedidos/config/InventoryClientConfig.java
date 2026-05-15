package com.api.pedidos.config;

import com.api.pedidos.exception.BusinessRuleException;
import com.api.pedidos.exception.ExternalServiceUnavailableException;
import com.api.pedidos.exception.InsufficientStockException;
import com.api.pedidos.exception.ResourceNotFoundException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Configuration
public class InventoryClientConfig {

    /*
     * Cliente HTTP interno hacia inventory-service.
     * Se configura con baseUrl externa para que cada ambiente apunte a su propio servicio.
     */
    @Bean
    public RestClient inventoryRestClient(
            @Value("${orders.inventory-service-url}") String inventoryServiceUrl) {
        return RestClient.builder()
                .baseUrl(inventoryServiceUrl)
                .build();
    }

    /*
     * Circuit Breaker para proteger pedidos cuando inventario no responde.
     * Los errores de negocio no cuentan como falla de disponibilidad.
     */
    @Bean
    public CircuitBreaker inventoryCircuitBreaker() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .slidingWindowSize(10)
                .minimumNumberOfCalls(5)
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .permittedNumberOfCallsInHalfOpenState(3)
                .recordException(this::shouldRecordInventoryFailure)
                .ignoreExceptions(
                        BusinessRuleException.class,
                        ResourceNotFoundException.class,
                        InsufficientStockException.class)
                .build();
        return CircuitBreaker.of("inventory-service", config);
    }

    private boolean shouldRecordInventoryFailure(Throwable throwable) {
        if (throwable instanceof ExternalServiceUnavailableException
                || throwable instanceof ResourceAccessException) {
            return true;
        }
        if (throwable instanceof RestClientResponseException responseException) {
            return responseException.getStatusCode().is5xxServerError();
        }
        return false;
    }
}
