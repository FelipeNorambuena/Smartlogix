package com.api.pedidos.exception;

/*
 * Error de autorizacion cuando el usuario autenticado no puede operar el recurso.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
