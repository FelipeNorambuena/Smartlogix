package com.api.pedidos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.api.pedidos.client.InventoryClient;
import com.api.pedidos.dto.OrderCreateRequest;
import com.api.pedidos.dto.OrderItemRequest;
import com.api.pedidos.dto.OrderResponse;
import com.api.pedidos.dto.ProductInfoResponse;
import com.api.pedidos.dto.StockAvailabilityResponse;
import com.api.pedidos.exception.BusinessRuleException;
import com.api.pedidos.model.Order;
import com.api.pedidos.model.OrderItem;
import com.api.pedidos.model.OrderStatus;
import com.api.pedidos.repository.OrderRepository;
import com.api.pedidos.security.UserContext;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * Pruebas unitarias de OrderService.
 * Validan reglas de pedidos sin levantar Spring ni conectarse a MySQL/inventario real.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private OrderService orderService;

    @Test
    void createOrderValidatesInventoryReservesStockAndSavesConfirmedOrder() {
        UUID customerId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        OrderCreateRequest request = new OrderCreateRequest(
                "Santiago Centro 123",
                List.of(new OrderItemRequest("sku-001", 2)));

        when(inventoryClient.findProductBySku("SKU-001")).thenReturn(product(productId));
        when(inventoryClient.checkAvailability(productId, 2)).thenReturn(availability(productId, true));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.createOrder(request, client(customerId));

        assertThat(response.customerId()).isEqualTo(customerId);
        assertThat(response.status()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(response.totalAmount()).isEqualByComparingTo("19980.00");
        verify(inventoryClient).reserveStock(productId, 2);
    }

    @Test
    void createOrderRejectsDuplicatedSkuBeforeCallingInventory() {
        OrderCreateRequest request = new OrderCreateRequest(
                "Santiago Centro 123",
                List.of(
                        new OrderItemRequest("sku-001", 1),
                        new OrderItemRequest(" SKU-001 ", 1)));

        assertThatThrownBy(() -> orderService.createOrder(request, client(UUID.randomUUID())))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("duplicado");

        verify(inventoryClient, never()).findProductBySku(any());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void cancelConfirmedOrderReleasesReservedStock() {
        UUID orderId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        Order order = confirmedOrder(customerId, productId);

        when(orderRepository.findByIdForUpdate(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.cancel(client(customerId), orderId);

        assertThat(response.status()).isEqualTo(OrderStatus.CANCELLED);
        verify(inventoryClient).releaseReservedStock(productId, 3);
    }

    @Test
    void shipConfirmedOrderConfirmsReservedStockForOperators() {
        UUID orderId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        Order order = confirmedOrder(UUID.randomUUID(), productId);

        when(orderRepository.findByIdForUpdate(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        orderService.updateStatus(operator(), orderId, new com.api.pedidos.dto.OrderStatusUpdateRequest("shipped"));

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());
        assertThat(orderCaptor.getValue().getStatus()).isEqualTo(OrderStatus.SHIPPED);
        verify(inventoryClient).confirmReservedStock(productId, 3);
    }

    private UserContext client(UUID customerId) {
        return new UserContext(customerId, Set.of("CLIENTE"));
    }

    private UserContext operator() {
        return new UserContext(UUID.randomUUID(), Set.of("OPERADOR_PEDIDOS"));
    }

    private ProductInfoResponse product(UUID productId) {
        return new ProductInfoResponse(
                productId,
                "SKU-001",
                "Producto test",
                "Producto de prueba",
                new BigDecimal("9990.00"),
                "general",
                true,
                OffsetDateTime.now(),
                OffsetDateTime.now());
    }

    private StockAvailabilityResponse availability(UUID productId, boolean available) {
        return new StockAvailabilityResponse(
                productId,
                "SKU-001",
                "Producto test",
                2,
                10,
                0,
                10,
                "Santiago",
                true,
                available);
    }

    private Order confirmedOrder(UUID customerId, UUID productId) {
        Order order = new Order();
        order.setCustomerId(customerId);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setShippingAddress("Santiago Centro 123");

        OrderItem item = new OrderItem();
        item.setProductId(productId);
        item.setSku("SKU-001");
        item.setProductName("Producto test");
        item.setQuantity(3);
        item.setUnitPrice(new BigDecimal("9990.00"));
        order.addItem(item);
        order.calculateTotalAmount();
        return order;
    }
}
