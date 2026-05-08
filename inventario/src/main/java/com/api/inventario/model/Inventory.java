package com.api.inventario.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "inventory")
@Getter
@Setter
public class Inventory {

    /*
     * Entidad JPA que guarda el stock de un producto.
     * La relacion con Product es uno a uno: cada producto tiene como maximo
     * una fila de inventario.
     */
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    // Producto asociado. LAZY evita cargar el producto hasta que se necesite.
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    // Stock total disponible fisicamente o logicamente para el producto.
    @Column(name = "stock_available", nullable = false)
    private int stockAvailable;

    // Stock reservado por pedidos u operaciones pendientes.
    @Column(name = "stock_reserved", nullable = false)
    private int stockReserved;

    // Ubicacion de bodega o referencia interna de almacenamiento.
    @Column(name = "warehouse_location")
    private String warehouseLocation;

    // Umbral que indica cuando el producto deberia reponerse.
    @Column(name = "reorder_point", nullable = false)
    private int reorderPoint;

    // Referencia opcional al id del sistema antiguo usado durante migraciones.
    @Column(name = "legacy_inventory_id", unique = true)
    private Integer legacyInventoryId;

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

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getStockAvailable() {
        return stockAvailable;
    }

    public void setStockAvailable(int stockAvailable) {
        this.stockAvailable = stockAvailable;
    }

    public int getStockReserved() {
        return stockReserved;
    }

    public void setStockReserved(int stockReserved) {
        this.stockReserved = stockReserved;
    }

    public String getWarehouseLocation() {
        return warehouseLocation;
    }

    public void setWarehouseLocation(String warehouseLocation) {
        this.warehouseLocation = warehouseLocation;
    }

    public int getReorderPoint() {
        return reorderPoint;
    }

    public void setReorderPoint(int reorderPoint) {
        this.reorderPoint = reorderPoint;
    }

    public Integer getLegacyInventoryId() {
        return legacyInventoryId;
    }

    public void setLegacyInventoryId(Integer legacyInventoryId) {
        this.legacyInventoryId = legacyInventoryId;
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
