package com.api.pedidos.service;

import com.api.pedidos.client.InventoryClient;
import com.api.pedidos.dto.ProductInfoResponse;
import com.api.pedidos.dto.OrderCreateRequest;
import com.api.pedidos.dto.OrderResponse;
import com.api.pedidos.model.Order;
import com.api.pedidos.model.OrderItem;
import com.api.pedidos.model.OrderStatus;
import com.api.pedidos.repository.OrderRepository;
import org.springframework.stereotype.Service;
import com.api.pedidos.exception.ProductNotFoundException;
import com.api.pedidos.exception.InsufficientStockException;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;

    public OrderService(OrderRepository orderRepository, InventoryClient inventoryClient) {
        this.orderRepository = orderRepository;
        this.inventoryClient = inventoryClient;
    }

    public OrderResponse createOrder(OrderCreateRequest request, UUID customerId) {
        Order order = new Order();
        order.setCustomerId(customerId);
        order.setShippingAddress(request.shippingAddress());
        order.setStatus(OrderStatus.PENDING); // El pedido inicia como pendiente.

        // PASO 1: Validar la existencia y disponibilidad de cada producto.
        for (var itemRequest : request.items()) {
            // Llamada real al servicio de inventario para obtener información del producto.
            ProductInfoResponse productInfo = inventoryClient.getProductBySku(itemRequest.sku())
                    .orElseThrow(() -> new ProductNotFoundException("Producto con SKU no encontrado: " + itemRequest.sku()));

            if (!productInfo.active()) {
                throw new ProductNotFoundException("El producto con SKU " + itemRequest.sku() + " no está activo.");
            }

            // Aquí iría la validación de stock, que también vendría del InventoryClient.
            // Por ejemplo, el servicio de inventario podría tener un endpoint para verificar disponibilidad.
            // boolean hasStock = inventoryClient.checkAvailability(productInfo.id(), itemRequest.quantity());
            // if (!hasStock) {
            //     throw new InsufficientStockException("Stock insuficiente para el producto con SKU: " + itemRequest.sku());
            // }

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(productInfo.id);
            orderItem.setSku(itemRequest.sku());
            orderItem.setProductName(productInfo.name);
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setUnitPrice(productInfo.unitPrice());
            order.addItem(orderItem);
        }

        order.calculateTotalAmount();
        Order savedOrder = orderRepository.save(order);

        // PASO 2: Reservar el stock en el inventario (llamada a POST /api/inventory/{productId}/reserve para cada item)

        // PASO 3: Procesar el pago (llamada a un futuro servicio de pagos)

        return OrderResponse.from(savedOrder);
    }
}