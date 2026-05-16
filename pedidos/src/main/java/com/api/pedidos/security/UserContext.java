package com.api.pedidos.security;

import com.api.pedidos.exception.UnauthorizedException;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/*
 * Identidad interna recibida desde API Gateway.
 * El gateway valida el JWT; pedidos usa estos datos para reglas de propietario.
 */
public record UserContext(
        UUID userId,
        Set<String> roles) {

    private static final Set<String> ORDER_OPERATOR_ROLES = Set.of("ADMIN", "OPERADOR_PEDIDOS");
    private static final String ADMIN_ROLE = "ADMIN";

    public static UserContext fromHeaders(String userIdHeader, String rolesHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new UnauthorizedException("No se recibio la identidad del usuario autenticado");
        }

        try {
            return new UserContext(UUID.fromString(userIdHeader), parseRoles(rolesHeader));
        } catch (IllegalArgumentException exception) {
            throw new UnauthorizedException("Identidad de usuario invalida");
        }
    }

    public boolean canManageOrders() {
        return roles.stream().anyMatch(ORDER_OPERATOR_ROLES::contains);
    }

    public boolean isAdmin() {
        return roles.contains(ADMIN_ROLE);
    }

    public boolean owns(UUID customerId) {
        return userId.equals(customerId);
    }

    private static Set<String> parseRoles(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(rolesHeader.split(","))
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .map(role -> role.toUpperCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
    }
}
