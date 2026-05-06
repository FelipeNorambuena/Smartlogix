package com.api.inventario.exception;

import java.time.OffsetDateTime;
import java.util.Map;

/*
 * Formato unico de error para la API.
 * Mantener una estructura comun facilita consumir errores desde Postman,
 * frontend u otros microservicios.
 */
public record ApiErrorResponse(
        // Momento en que se genero el error.
        OffsetDateTime timestamp,
        // Codigo HTTP numerico, por ejemplo 400 o 404.
        int status,
        // Texto estandar del estado HTTP.
        String error,
        // Mensaje legible para explicar la causa.
        String message,
        // Ruta que produjo el error.
        String path,
        // Detalles por campo, usado principalmente en errores de validacion.
        Map<String, String> details) {
}
