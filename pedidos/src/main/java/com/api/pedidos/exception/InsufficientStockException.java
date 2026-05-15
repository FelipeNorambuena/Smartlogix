package com.api.pedidos.exception;

/*
 * Error especifico para falta de stock o fallo de reserva en inventario.
 */
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }
}
