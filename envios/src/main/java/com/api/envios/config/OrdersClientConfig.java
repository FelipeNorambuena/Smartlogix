package com.api.envios.config;

import com.api.envios.exception.BusinessRuleException;
import com.api.envios.exception.ExternalServiceUnavailableException;
import com.api.envios.exception.ResourceNotFoundException;
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
public class OrdersClientConfig {

    /*
     * Cliente HTTP interno hacia pedidos-service.
     */
    @Bean
    public RestClient ordersRestClient(
            @Value("${shipping.orders-service-url}") String ordersServiceUrl) {
        return RestClient.builder()
                .baseUrl(ordersServiceUrl)
                .build();
    }

    /*
     * Circuit Breaker para proteger envios cuando pedidos-service no responde.
     */
    @Bean
    public CircuitBreaker ordersCircuitBreaker() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .slidingWindowSize(10)
                .minimumNumberOfCalls(5)
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .permittedNumberOfCallsInHalfOpenState(3)
                .recordException(this::shouldRecordOrdersFailure)
                .ignoreExceptions(
                        BusinessRuleException.class,
                        ResourceNotFoundException.class)
                .build();
        return CircuitBreaker.of("pedidos-service", config);
    }

    private boolean shouldRecordOrdersFailure(Throwable throwable) {
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
