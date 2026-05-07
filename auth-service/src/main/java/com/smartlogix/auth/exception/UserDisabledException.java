package com.smartlogix.auth.exception;

/*
 * Cuenta existente pero desactivada administrativamente.
 */
public class UserDisabledException extends RuntimeException {

    public UserDisabledException() {
        super("La cuenta esta desactivada");
    }
}
