package com.smartlogix.auth.exception;

/*
 * Login fallido sin revelar si el email o la password fueron incorrectos.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Credenciales invalidas");
    }
}
