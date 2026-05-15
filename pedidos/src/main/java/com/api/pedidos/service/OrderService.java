package com.api.pedidos.service;

import com.api.pedidos.dto.OrderCreateRequest;
import com.api.pedidos.dto.OrderResponse;
import com.api.pedidos.model.Order;
import com.api.pedidos.model.OrderItem;
import com.api.pedidos.model.OrderStatus;
import com.api.pedidos.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    // private final InventoryClient inventoryClient; // A ser inyectado cuando se implemente

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderResponse createOrder(OrderCreateRequest request, UUID customerId) {
        // PASO 1: Validar la existencia y disponibilidad de cada producto en el inventario.
        //         Este paso requerira un cliente HTTP (WebClient) para llamar al servicio de inventario.
        //         Por ahora, simularemos los datos del producto.

        Order order = new Order();
        order.setCustomerId(customerId);
        order.setShippingAddress(request.shippingAddress());
        order.setStatus(OrderStatus.PENDING); // El pedido inicia como pendiente.

        request.items().forEach(itemRequest -> {
            // --- INICIO: Bloque a reemplazar con llamada a Inventory-Service ---
            // ProductInfo productInfo = inventoryClient.getProductBySku(itemRequest.sku());
            // if (productInfo == null) throw new RuntimeException("Producto no encontrado: " + itemRequest.sku());
            // if (productInfo.stock() < itemRequest.quantity()) throw new RuntimeException("Stock insuficiente para: " + itemRequest.sku());

            // Simulacion de datos del producto
            var productInfo = new Object() {
                UUID id = UUID.randomUUID();
                String name = "Producto Simulado";
                java.math.BigDecimal price = new java.math.BigDecimal("10.00");
            };
            // --- FIN: Bloque a reemplazar ---

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(productInfo.id);
            orderItem.setSku(itemRequest.sku());
            orderItem.setProductName(productInfo.name);
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setUnitPrice(productInfo.price);
            order.addItem(orderItem);
        });

        order.calculateTotalAmount();
        Order savedOrder = orderRepository.save(order);

        // PASO 2: Reservar el stock en el inventario (llamada a POST /api/inventory/{productId}/reserve)

        // PASO 3: Procesar el pago (llamada a un futuro servicio de pagos)

        return OrderResponse.from(savedOrder);
    }
}