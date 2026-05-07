package com.smartlogix.auth.exception;

import java.time.OffsetDateTime;
import java.util.Map;

/*
 * Contrato unico de errores para auth-service.
 */
public record ApiErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> details) {
}
