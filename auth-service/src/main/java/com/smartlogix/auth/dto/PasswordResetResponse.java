package com.smartlogix.auth.dto;

/*
 * Respuesta simple para el flujo de restablecimiento de clave.
 * No incluye usuario completo ni token de sesion.
 */
public record PasswordResetResponse(
        String message) {
}
