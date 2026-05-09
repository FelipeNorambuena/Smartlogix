package com.api.envios.exception;

/*
 * Excepcion para reglas de negocio incumplidas.
 * El GlobalExceptionHandler la transforma en HTTP 400 Bad Request.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
