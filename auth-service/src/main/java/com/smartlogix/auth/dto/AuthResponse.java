package com.smartlogix.auth.dto;

import java.time.Instant;

/*
 * Respuesta de login/registro con JWT listo para enviar como Bearer token.
 */
public record AuthResponse(
        String token,
        String tokenType,
        Instant expiresAt,
        UserResponse user) {

    public static AuthResponse bearer(String token, Instant expiresAt, UserResponse user) {
        return new AuthResponse(token, "Bearer", expiresAt, user);
    }
}
