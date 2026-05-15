package com.api.pedidos.controller;

import com.api.pedidos.dto.OrderCreateRequest;
import com.api.pedidos.dto.OrderResponse;
import com.api.pedidos.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        // En un sistema real, el ID del cliente se obtendria del token de autenticacion (JWT).
        // Por ahora, usaremos un UUID fijo para simular un cliente autenticado.
        UUID customerId = UUID.fromString("f47ac10b-58cc-4372-a567-0e02b2c3d479");

        OrderResponse orderResponse = orderService.createOrder(request, customerId);
        return new ResponseEntity<>(orderResponse, HttpStatus.CREATED);
    }
}