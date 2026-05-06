package com.api.inventario.exception;

/*
 * Excepcion para recursos inexistentes.
 * El GlobalExceptionHandler la transforma en HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
