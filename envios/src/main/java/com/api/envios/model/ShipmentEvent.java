package com.api.envios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "shipment_events")
public class ShipmentEvent {

    /*
     * Entidad JPA para el historial de tracking.
     * Cada evento registra un estado del envio en un momento especifico.
     */
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    // Envio dueño del evento. LAZY evita cargarlo cuando solo se lista el historial.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    // Estado registrado en este hito del seguimiento.
    @Column(nullable = false)
    private String status;

    // Ubicacion opcional donde ocurrio el evento.
    private String location;

    // Descripcion legible del evento para usuarios o soporte.
    private String description;

    // Momento real del evento; puede venir desde el transportista.
    @Column(name = "occurred_at", nullable = false)
    private OffsetDateTime occurredAt;

    // Fecha de insercion del registro en SmartLogix.
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        // Si no se informa fecha del evento, se usa el momento de registro.
        OffsetDateTime now = OffsetDateTime.now();
        if (occurredAt == null) {
            occurredAt = now;
        }
        createdAt = now;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public void setShipment(Shipment shipment) {
        this.shipment = shipment;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public OffsetDateTime getOccurredAt() {
        return occurredAt;
    }

    public void setOccurredAt(OffsetDateTime occurredAt) {
        this.occurredAt = occurredAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
