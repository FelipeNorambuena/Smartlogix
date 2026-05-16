package com.api.pedidos.controller;

import com.api.pedidos.dto.OrderCreateRequest;
import com.api.pedidos.dto.OrderStatusUpdateRequest;
import com.api.pedidos.dto.PageResponse;
import com.api.pedidos.dto.OrderResponse;
import com.api.pedidos.security.UserContext;
import com.api.pedidos.service.OrderService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    /*
     * Controller HTTP para pedidos.
     * Recibe identidad ya validada por API Gateway y delega reglas de negocio a OrderService.
     */
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public PageResponse<OrderResponse> findAll(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return orderService.search(userContext(userId, roles), customerId, status, page, size);
    }

    @GetMapping("/{id}")
    public OrderResponse findById(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @PathVariable UUID id) {
        return orderService.findById(userContext(userId, roles), id);
    }

    @GetMapping("/customer/{customerId}")
    public PageResponse<OrderResponse> findByCustomerId(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return orderService.findByCustomerId(userContext(userId, roles), customerId, page, size);
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @Valid @RequestBody OrderCreateRequest request) {
        OrderResponse orderResponse = orderService.createOrder(request, userContext(userId, roles), authorization);
        return ResponseEntity
                .created(URI.create("/api/orders/" + orderResponse.id()))
                .body(orderResponse);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @PathVariable UUID id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateStatus(userContext(userId, roles), id, request);
    }

    @DeleteMapping("/{id}")
    public OrderResponse cancel(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @PathVariable UUID id) {
        return orderService.cancel(userContext(userId, roles), id);
    }

    private UserContext userContext(String userId, String roles) {
        return UserContext.fromHeaders(userId, roles);
    }
}
