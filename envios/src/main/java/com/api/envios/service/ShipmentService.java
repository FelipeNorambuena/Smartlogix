package com.api.envios.service;

import com.api.envios.client.OrdersClient;
import com.api.envios.dto.OrderInfoResponse;
import com.api.envios.dto.PageResponse;
import com.api.envios.dto.ShipmentCreateRequest;
import com.api.envios.dto.ShipmentEventResponse;
import com.api.envios.dto.ShipmentResponse;
import com.api.envios.dto.ShipmentStatusUpdateRequest;
import com.api.envios.dto.ShipmentUpdateRequest;
import com.api.envios.exception.BusinessRuleException;
import com.api.envios.exception.ResourceNotFoundException;
import com.api.envios.model.Shipment;
import com.api.envios.model.ShipmentEvent;
import com.api.envios.repository.ShipmentEventRepository;
import com.api.envios.repository.ShipmentRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ShipmentService {

    /*
     * Service de envios.
     * Centraliza reglas logisticas: un envio por pedido, tracking unico,
     * cambios de estado y registro de eventos.
     */
    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_READY_TO_SHIP = "ready_to_ship";
    private static final String STATUS_IN_TRANSIT = "in_transit";
    private static final String STATUS_DELIVERED = "delivered";
    private static final String STATUS_FAILED = "failed";
    private static final String STATUS_RETURNED = "returned";
    private static final String STATUS_CANCELLED = "cancelled";
    private static final String ORDER_STATUS_CONFIRMED = "CONFIRMED";
    private static final String ORDER_STATUS_SHIPPED = "SHIPPED";

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            STATUS_PENDING,
            STATUS_READY_TO_SHIP,
            STATUS_IN_TRANSIT,
            STATUS_DELIVERED,
            STATUS_FAILED,
            STATUS_RETURNED,
            STATUS_CANCELLED);

    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
            STATUS_PENDING, Set.of(STATUS_READY_TO_SHIP, STATUS_CANCELLED),
            STATUS_READY_TO_SHIP, Set.of(STATUS_IN_TRANSIT, STATUS_CANCELLED),
            STATUS_IN_TRANSIT, Set.of(STATUS_DELIVERED, STATUS_FAILED, STATUS_RETURNED),
            STATUS_FAILED, Set.of(STATUS_READY_TO_SHIP, STATUS_RETURNED, STATUS_CANCELLED),
            STATUS_RETURNED, Set.of(),
            STATUS_DELIVERED, Set.of(),
            STATUS_CANCELLED, Set.of());

    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventRepository shipmentEventRepository;
    private final OrdersClient ordersClient;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentEventRepository shipmentEventRepository,
            OrdersClient ordersClient) {
        this.shipmentRepository = shipmentRepository;
        this.shipmentEventRepository = shipmentEventRepository;
        this.ordersClient = ordersClient;
    }

    @Transactional(readOnly = true)
    public PageResponse<ShipmentResponse> search(
            UUID orderId,
            String status,
            String carrier,
            String trackingNumber,
            int page,
            int size) {
        // Listado paginado para operacion: filtros por pedido, estado, transportista y tracking.
        PageRequest pageRequest = PageRequest.of(
                validatePage(page),
                validateSize(size),
                Sort.by("createdAt").descending());
        return PageResponse.from(shipmentRepository.search(
                        orderId,
                        normalizeStatusOrNull(status),
                        trimToNull(carrier),
                        trimToNull(trackingNumber),
                        pageRequest)
                .map(ShipmentResponse::from));
    }

    @Transactional(readOnly = true)
    public ShipmentResponse findById(UUID id) {
        // Busca por identificador interno UUID.
        return ShipmentResponse.from(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public ShipmentResponse findByOrderId(UUID orderId) {
        // Permite a pedidos consultar el despacho asociado a una orden.
        return ShipmentResponse.from(shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Envio no encontrado para pedido " + orderId)));
    }

    @Transactional(readOnly = true)
    public ShipmentResponse findByTrackingNumber(String trackingNumber) {
        // Normaliza el codigo para evitar diferencias por espacios.
        String normalizedTrackingNumber = normalizeTrackingNumber(trackingNumber);
        return ShipmentResponse.from(shipmentRepository.findByTrackingNumber(normalizedTrackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Envio no encontrado para tracking " + normalizedTrackingNumber)));
    }

    @Transactional(readOnly = true)
    public List<ShipmentEventResponse> findEvents(UUID shipmentId) {
        // Valida primero que el envio exista para diferenciar 404 de lista vacia.
        findEntityById(shipmentId);
        return shipmentEventRepository.findByShipmentIdOrderByOccurredAtDescCreatedAtDesc(shipmentId).stream()
                .map(ShipmentEventResponse::from)
                .toList();
    }

    public ShipmentResponse create(ShipmentCreateRequest request) {
        OrderInfoResponse order = ordersClient.findOrderById(request.orderId());
        validateOrderIsReadyForShipping(order);

        // Un pedido solo puede tener un envio; se evita duplicar despachos.
        if (shipmentRepository.existsByOrderId(request.orderId())) {
            throw new BusinessRuleException("Ya existe un envio para el pedido " + request.orderId());
        }

        String trackingNumber = normalizeTrackingNumberOrNull(request.trackingNumber());
        validateTrackingNumberIsAvailable(trackingNumber, null);

        // Se construye la entidad desde el DTO para no exponer el modelo JPA en la API.
        Shipment shipment = new Shipment();
        shipment.setOrderId(request.orderId());
        String initialStatus = resolveInitialShipmentStatus(order.status());
        OffsetDateTime initialEventDate = OffsetDateTime.now();
        shipment.setStatus(initialStatus);
        if (STATUS_IN_TRANSIT.equals(initialStatus)) {
            shipment.setShippedAt(initialEventDate);
        }
        shipment.setShippingAddress(resolveShippingAddress(request, order));
        shipment.setCarrier(trimToNull(request.carrier()));
        shipment.setTrackingNumber(trackingNumber);

        Shipment saved = shipmentRepository.save(shipment);
        registerEvent(saved, initialStatus, null, "Envio creado", initialEventDate);
        return ShipmentResponse.from(saved);
    }

    public ShipmentResponse update(UUID id, ShipmentUpdateRequest request) {
        // Primero se valida que el envio exista; si no, se informa 404.
        Shipment shipment = findEntityById(id);
        String trackingNumber = normalizeTrackingNumberOrNull(request.trackingNumber());
        validateTrackingNumberIsAvailable(trackingNumber, id);

        shipment.setShippingAddress(request.shippingAddress().trim());
        shipment.setCarrier(trimToNull(request.carrier()));
        shipment.setTrackingNumber(trackingNumber);

        return ShipmentResponse.from(shipmentRepository.save(shipment));
    }

    public ShipmentResponse updateStatus(UUID id, ShipmentStatusUpdateRequest request) {
        // Bloquea la fila para que dos operadores no cambien estado al mismo tiempo.
        Shipment shipment = shipmentRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Envio no encontrado con id " + id));
        String newStatus = normalizeStatus(request.status());
        validateStatusTransition(shipment.getStatus(), newStatus);

        shipment.setStatus(newStatus);
        applyAutomaticDates(shipment, newStatus, request.occurredAt());
        Shipment saved = shipmentRepository.save(shipment);
        registerEvent(
                saved,
                newStatus,
                trimToNull(request.location()),
                trimToNull(request.description()),
                request.occurredAt());
        return ShipmentResponse.from(saved);
    }

    public ShipmentResponse cancel(UUID id) {
        // Cancelar usa la misma regla de transicion que un cambio de estado normal.
        ShipmentStatusUpdateRequest request = new ShipmentStatusUpdateRequest(
                STATUS_CANCELLED,
                null,
                "Envio cancelado",
                OffsetDateTime.now());
        return updateStatus(id, request);
    }

    private Shipment findEntityById(UUID id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Envio no encontrado con id " + id));
    }

    private void validateOrderIsReadyForShipping(OrderInfoResponse order) {
        if (order == null || order.id() == null) {
            throw new ResourceNotFoundException("Pedido no encontrado para crear envio");
        }
        if (!ORDER_STATUS_CONFIRMED.equalsIgnoreCase(order.status())
                && !ORDER_STATUS_SHIPPED.equalsIgnoreCase(order.status())) {
            throw new BusinessRuleException(
                    "Solo se puede crear envio para pedidos confirmados o enviados. Estado actual: " + order.status());
        }
        if (trimToNull(order.shippingAddress()) == null) {
            throw new BusinessRuleException("El pedido no tiene direccion de envio");
        }
    }

    private String resolveShippingAddress(ShipmentCreateRequest request, OrderInfoResponse order) {
        String requestAddress = trimToNull(request.shippingAddress());
        return requestAddress != null ? requestAddress : order.shippingAddress().trim();
    }

    private String resolveInitialShipmentStatus(String orderStatus) {
        if (ORDER_STATUS_SHIPPED.equalsIgnoreCase(orderStatus)) {
            return STATUS_IN_TRANSIT;
        }
        return STATUS_PENDING;
    }

    private void registerEvent(
            Shipment shipment,
            String status,
            String location,
            String description,
            OffsetDateTime occurredAt) {
        // Cada cambio relevante queda como historial consultable por tracking.
        ShipmentEvent event = new ShipmentEvent();
        event.setShipment(shipment);
        event.setStatus(status);
        event.setLocation(location);
        event.setDescription(description);
        event.setOccurredAt(occurredAt);
        shipmentEventRepository.save(event);
    }

    private void applyAutomaticDates(Shipment shipment, String status, OffsetDateTime occurredAt) {
        // Las fechas principales se completan automaticamente segun el estado logistico.
        OffsetDateTime eventDate = occurredAt != null ? occurredAt : OffsetDateTime.now();
        if (STATUS_IN_TRANSIT.equals(status) && shipment.getShippedAt() == null) {
            shipment.setShippedAt(eventDate);
        }
        if (STATUS_DELIVERED.equals(status) && shipment.getDeliveredAt() == null) {
            if (shipment.getShippedAt() == null) {
                shipment.setShippedAt(eventDate);
            }
            shipment.setDeliveredAt(eventDate);
        }
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Mantiene un flujo logistico simple y evita reabrir estados terminales.
        if (currentStatus.equals(newStatus)) {
            return;
        }
        Set<String> allowedNextStatuses = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowedNextStatuses.contains(newStatus)) {
            throw new BusinessRuleException(
                    "No se puede cambiar el envio de " + currentStatus + " a " + newStatus);
        }
    }

    private void validateTrackingNumberIsAvailable(String trackingNumber, UUID currentShipmentId) {
        if (trackingNumber == null) {
            return;
        }
        boolean exists = currentShipmentId == null
                ? shipmentRepository.existsByTrackingNumber(trackingNumber)
                : shipmentRepository.existsByTrackingNumberAndIdNot(trackingNumber, currentShipmentId);
        if (exists) {
            throw new BusinessRuleException("Ya existe un envio con tracking " + trackingNumber);
        }
    }

    private String normalizeStatus(String status) {
        String normalizedStatus = status.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new BusinessRuleException("Estado de envio no permitido: " + status);
        }
        return normalizedStatus;
    }

    private String normalizeStatusOrNull(String status) {
        if (status == null || status.trim().isEmpty()) {
            return null;
        }
        return normalizeStatus(status);
    }

    private String normalizeTrackingNumber(String trackingNumber) {
        String normalizedTrackingNumber = trimToNull(trackingNumber);
        if (normalizedTrackingNumber == null) {
            throw new BusinessRuleException("El tracking no puede estar vacio");
        }
        return normalizedTrackingNumber;
    }

    private String normalizeTrackingNumberOrNull(String trackingNumber) {
        return trimToNull(trackingNumber);
    }

    private int validatePage(int page) {
        if (page < 0) {
            throw new BusinessRuleException("La pagina no puede ser negativa");
        }
        return page;
    }

    private int validateSize(int size) {
        if (size < 1 || size > 100) {
            throw new BusinessRuleException("El tamano de pagina debe estar entre 1 y 100");
        }
        return size;
    }

    private String trimToNull(String value) {
        // Guarda null en campos opcionales vacios para evitar strings sin contenido.
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
