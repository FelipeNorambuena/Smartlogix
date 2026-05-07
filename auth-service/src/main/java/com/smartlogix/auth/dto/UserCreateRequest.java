package com.smartlogix.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

/*
 * Alta administrativa de usuarios.
 * Permite asignar roles iniciales; si no llegan roles, se usa CLIENTE.
 */
public record UserCreateRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password,
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        Set<@NotBlank String> roles,
        Boolean enabled) {
}
