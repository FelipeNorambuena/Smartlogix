package com.api.pedidos.exception;

/*
 * Error para recursos inexistentes.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
