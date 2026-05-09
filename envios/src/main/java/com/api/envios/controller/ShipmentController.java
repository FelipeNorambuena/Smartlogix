package com.api.envios.controller;

import com.api.envios.dto.PageResponse;
import com.api.envios.dto.ShipmentCreateRequest;
import com.api.envios.dto.ShipmentEventResponse;
import com.api.envios.dto.ShipmentResponse;
import com.api.envios.dto.ShipmentStatusUpdateRequest;
import com.api.envios.dto.ShipmentUpdateRequest;
import com.api.envios.service.ShipmentService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    /*
     * Controller HTTP para envios.
     * Su responsabilidad es recibir solicitudes REST, validar el body con
     * @Valid y delegar la logica de negocio a ShipmentService.
     */
    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping
    public PageResponse<ShipmentResponse> findAll(
            @RequestParam(required = false) UUID orderId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String carrier,
            @RequestParam(required = false) String trackingNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // Retorna envios con filtros y paginacion para operacion logistica.
        return shipmentService.search(orderId, status, carrier, trackingNumber, page, size);
    }

    @GetMapping("/{id}")
    public ShipmentResponse findById(@PathVariable UUID id) {
        // Busca por identificador interno UUID.
        return shipmentService.findById(id);
    }

    @GetMapping("/order/{orderId}")
    public ShipmentResponse findByOrderId(@PathVariable UUID orderId) {
        // Permite consultar el envio desde el identificador del pedido.
        return shipmentService.findByOrderId(orderId);
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ShipmentResponse findByTrackingNumber(@PathVariable String trackingNumber) {
        // Consulta publica de seguimiento usando el codigo de tracking.
        return shipmentService.findByTrackingNumber(trackingNumber);
    }

    @GetMapping("/{id}/events")
    public List<ShipmentEventResponse> findEvents(@PathVariable UUID id) {
        // Entrega la linea de tiempo completa del envio.
        return shipmentService.findEvents(id);
    }

    @PostMapping
    public ResponseEntity<ShipmentResponse> create(@Valid @RequestBody ShipmentCreateRequest request) {
        // Crea el envio y devuelve 201 Created con la ubicacion del nuevo recurso.
        ShipmentResponse response = shipmentService.create(request);
        return ResponseEntity
                .created(URI.create("/api/shipments/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public ShipmentResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody ShipmentUpdateRequest request) {
        // Actualiza datos editables del envio sin modificar su estado.
        return shipmentService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public ShipmentResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ShipmentStatusUpdateRequest request) {
        // Cambia estado y registra un evento de tracking.
        return shipmentService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    public ShipmentResponse cancel(@PathVariable UUID id) {
        // Baja logica operativa: cancela el envio en vez de borrarlo de la BD.
        return shipmentService.cancel(id);
    }
}
