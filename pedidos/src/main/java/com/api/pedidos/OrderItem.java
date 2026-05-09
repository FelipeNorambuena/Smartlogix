package com.api.pedidos.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Getter
@Setter
public class OrderItem {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    // Relacion con la orden a la que pertenece.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // ID del producto en el microservicio de inventario.
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    // SKU del producto, denormalizado para facilitar consultas.
    @Column(nullable = false)
    private String sku;

    // Nombre del producto, denormalizado.
    @Column(name = "product_name", nullable = false)
    private String productName;

    // Cantidad de unidades de este producto en el pedido.
    @Column(nullable = false)
    private int quantity;

    // Precio unitario del producto al momento de la compra.
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

}