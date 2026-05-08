package com.smartlogix.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/*
 * Edicion de datos basicos del usuario.
 * Los roles y el estado se actualizan con endpoints separados.
 */
public record UserUpdateRequest(
        @NotBlank @Email String email,
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName) {
}
