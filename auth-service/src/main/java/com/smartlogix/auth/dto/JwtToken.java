package com.smartlogix.auth.dto;

import java.time.Instant;

/*
 * Valor interno para transportar el token generado y su fecha de expiracion.
 */
public record JwtToken(String value, Instant expiresAt) {
}
