package com.api.pedidos.config;

import com.api.pedidos.exception.BusinessRuleException;
import com.api.pedidos.exception.ExternalServiceUnavailableException;
import com.api.pedidos.exception.ForbiddenException;
import com.api.pedidos.exception.ResourceNotFoundException;
import com.api.pedidos.exception.UnauthorizedException;
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
public class AuthClientConfig {

    /*
     * Cliente HTTP interno hacia auth-service para validaciones de identidad.
     */
    @Bean
    public RestClient authRestClient(@Value("${orders.auth-service-url}") String authServiceUrl) {
        return RestClient.builder()
                .baseUrl(authServiceUrl)
                .build();
    }

    /*
     * Circuit Breaker para evitar que pedidos quede bloqueado si auth-service no responde.
     * Los errores de permisos, validacion o usuario inexistente no cuentan como caida del servicio.
     */
    @Bean
    public CircuitBreaker authCircuitBreaker() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .slidingWindowSize(10)
                .minimumNumberOfCalls(5)
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .permittedNumberOfCallsInHalfOpenState(3)
                .recordException(this::shouldRecordAuthFailure)
                .ignoreExceptions(
                        BusinessRuleException.class,
                        ForbiddenException.class,
                        ResourceNotFoundException.class,
                        UnauthorizedException.class)
                .build();
        return CircuitBreaker.of("auth-service", config);
    }

    private boolean shouldRecordAuthFailure(Throwable throwable) {
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
