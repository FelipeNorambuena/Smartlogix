package com.api.inventario.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "products")
public class Product {

    /*
     * Entidad JPA que representa un producto vendible o almacenable.
     * Se persiste en la tabla products y se identifica con UUID.
     */
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    // Codigo comercial unico utilizado para busquedas y operaciones externas.
    @Column(nullable = false, unique = true)
    private String sku;

    // Nombre visible del producto.
    @Column(nullable = false)
    private String name;

    // Descripcion opcional para entregar mas detalle al usuario.
    private String description;

    // Precio unitario con precision fija para evitar errores de redondeo binario.
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    // Categoria libre para clasificar productos sin una tabla adicional.
    private String category;

    // Permite baja logica: false oculta el producto sin eliminarlo de la BD.
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    // Referencia opcional al id del sistema antiguo usado durante migraciones.
    @Column(name = "legacy_product_id", unique = true)
    private Integer legacyProductId;

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

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getLegacyProductId() {
        return legacyProductId;
    }

    public void setLegacyProductId(Integer legacyProductId) {
        this.legacyProductId = legacyProductId;
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
