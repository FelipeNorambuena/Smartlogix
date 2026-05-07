package com.smartlogix.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/*
 * Credenciales para iniciar sesion.
 */
public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password) {
}
