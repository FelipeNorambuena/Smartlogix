package com.api.pedidos.exception;

/*
 * Error de regla de negocio controlada.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
