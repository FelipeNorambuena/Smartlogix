package com.api.pedidos.exception;

/*
 * Error cuando falta la identidad enviada por el API Gateway.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
