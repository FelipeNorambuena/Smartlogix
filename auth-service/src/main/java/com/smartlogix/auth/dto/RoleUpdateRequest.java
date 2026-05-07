package com.smartlogix.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

/*
 * Reemplaza el conjunto completo de roles de un usuario.
 */
public record RoleUpdateRequest(
        @NotEmpty Set<@NotBlank String> roles) {
}
