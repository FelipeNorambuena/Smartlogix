package com.smartlogix.auth.dto;

import com.smartlogix.auth.model.Role;
import com.smartlogix.auth.model.User;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/*
 * Respuesta publica de usuario.
 * Nunca incluye passwordHash ni datos sensibles.
 */
public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        boolean enabled,
        List<String> roles,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {

    public static UserResponse from(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .sorted()
                .toList();

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.isEnabled(),
                roleNames,
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
