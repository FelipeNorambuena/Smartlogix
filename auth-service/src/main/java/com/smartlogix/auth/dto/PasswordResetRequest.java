package com.smartlogix.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/*
 * Solicitud publica para restablecer clave en entorno academico.
 * No usa verificacion por email porque el proyecto universitario lo simplifica.
 */
public record PasswordResetRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String newPassword) {
}
