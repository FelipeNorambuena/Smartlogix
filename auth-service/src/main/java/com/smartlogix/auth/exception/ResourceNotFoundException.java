package com.smartlogix.auth.exception;

/*
 * Recurso inexistente dentro del auth-service.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
