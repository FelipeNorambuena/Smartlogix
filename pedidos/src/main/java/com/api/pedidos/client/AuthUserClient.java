package com.api.pedidos.client;

import com.api.pedidos.dto.AuthUserResponse;
import com.api.pedidos.exception.BusinessRuleException;
import com.api.pedidos.exception.ExternalServiceUnavailableException;
import com.api.pedidos.exception.ForbiddenException;
import com.api.pedidos.exception.ResourceNotFoundException;
import com.api.pedidos.exception.UnauthorizedException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import java.util.Locale;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class AuthUserClient {

    /*
     * Cliente REST hacia auth-service.
     * Pedidos no administra usuarios; solo valida que el customerId asignado
     * corresponda a un usuario activo con rol CLIENTE.
     */
    private final RestClient authRestClient;
    private final CircuitBreaker authCircuitBreaker;

    public AuthUserClient(RestClient authRestClient, CircuitBreaker authCircuitBreaker) {
        this.authRestClient = authRestClient;
        this.authCircuitBreaker = authCircuitBreaker;
    }

    public AuthUserResponse findUserById(UUID userId, String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new UnauthorizedException("No se recibio token para validar el cliente asignado");
        }

        return execute("validar usuario cliente", () -> authRestClient.get()
                .uri("/users/{id}", userId)
                .header(HttpHeaders.AUTHORIZATION, authorizationHeader)
                .retrieve()
                .body(AuthUserResponse.class));
    }

    private <T> T execute(String operation, Supplier<T> supplier) {
        try {
            return authCircuitBreaker.executeSupplier(supplier);
        } catch (CallNotPermittedException exception) {
            throw new ExternalServiceUnavailableException(
                    "Auth-service no esta disponible para " + operation, exception);
        } catch (RestClientResponseException exception) {
            throw mapHttpException(operation, exception);
        } catch (ResourceAccessException exception) {
            throw new ExternalServiceUnavailableException(
                    "No fue posible conectar con auth-service para " + operation, exception);
        }
    }

    private RuntimeException mapHttpException(String operation, RestClientResponseException exception) {
        int status = exception.getStatusCode().value();
        if (status == 401) {
            return new UnauthorizedException("Auth-service rechazo el token al " + operation);
        }
        if (status == 403) {
            return new ForbiddenException("No tienes permisos para " + operation + " en auth-service");
        }
        if (status == 404) {
            return new ResourceNotFoundException("Usuario cliente no encontrado en auth-service");
        }
        if (status == 400 || status == 409) {
            return new BusinessRuleException("Auth-service rechazo la solicitud: " + operation);
        }
        if (exception.getStatusCode().is5xxServerError()) {
            return new ExternalServiceUnavailableException("Auth-service fallo al " + operation, exception);
        }
        return new ExternalServiceUnavailableException(
                "Respuesta inesperada de auth-service al " + operation, exception);
    }

    public static boolean hasRole(AuthUserResponse user, String roleName) {
        if (user.roles() == null) {
            return false;
        }

        String normalizedRole = roleName.toUpperCase(Locale.ROOT);
        return user.roles().stream()
                .map(role -> role.toUpperCase(Locale.ROOT))
                .anyMatch(normalizedRole::equals);
    }
}
