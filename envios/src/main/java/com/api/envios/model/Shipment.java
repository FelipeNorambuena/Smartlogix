package com.api.envios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "shipments")
public class Shipment {

    /*
     * Entidad JPA que representa el envio asociado a un pedido.
     * La tabla mantiene un envio por orderId para reflejar la relacion
     * uno a uno definida en el modelo de SmartLogix.
     */
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    // Pedido al que pertenece el envio; se guarda como UUID para desacoplar microservicios.
    @Column(name = "order_id", nullable = false, unique = true)
    private UUID orderId;

    // Estado operativo del envio: pending, ready_to_ship, in_transit, etc.
    @Column(nullable = false)
    private String status = "pending";

    // Direccion final donde debe entregarse el pedido.
    @Column(name = "shipping_address", nullable = false, length = 500)
    private String shippingAddress;

    // Empresa transportista asignada al despacho.
    private String carrier;

    // Codigo de seguimiento visible para el cliente.
    @Column(name = "tracking_number", unique = true)
    private String trackingNumber;

    // Fecha en que el envio salio a transporte.
    @Column(name = "shipped_at")
    private OffsetDateTime shippedAt;

    // Fecha en que el envio fue entregado.
    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    // Referencia opcional al id del sistema antiguo usado durante migraciones.
    @Column(name = "legacy_shipment_id", unique = true)
    private Integer legacyShipmentId;

    // Fecha de creacion administrada por la entidad antes de persistir.
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Fecha de ultima modificacion actualizada automaticamente por callbacks JPA.
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        // En una insercion, ambas fechas parten con el mismo instante.
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        // En cada actualizacion solo cambia updatedAt; createdAt queda fijo.
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getCarrier() {
        return carrier;
    }

    public void setCarrier(String carrier) {
        this.carrier = carrier;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public OffsetDateTime getShippedAt() {
        return shippedAt;
    }

    public void setShippedAt(OffsetDateTime shippedAt) {
        this.shippedAt = shippedAt;
    }

    public OffsetDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(OffsetDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public Integer getLegacyShipmentId() {
        return legacyShipmentId;
    }

    public void setLegacyShipmentId(Integer legacyShipmentId) {
        this.legacyShipmentId = legacyShipmentId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
