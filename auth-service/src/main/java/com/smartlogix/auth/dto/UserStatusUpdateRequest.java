package com.smartlogix.auth.dto;

import jakarta.validation.constraints.NotNull;

/*
 * Activa o desactiva una cuenta sin eliminarla.
 */
public record UserStatusUpdateRequest(
        @NotNull Boolean enabled) {
}
