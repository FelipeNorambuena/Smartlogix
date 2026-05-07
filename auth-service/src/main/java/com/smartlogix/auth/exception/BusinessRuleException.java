package com.smartlogix.auth.exception;

/*
 * Error de negocio esperado: email duplicado, rol invalido, etc.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
