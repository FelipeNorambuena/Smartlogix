package com.api.pedidos.exception;

/*
 * Error controlado cuando un microservicio requerido no esta disponible.
 */
public class ExternalServiceUnavailableException extends RuntimeException {

    public ExternalServiceUnavailableException(String message) {
        super(message);
    }

    public ExternalServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
