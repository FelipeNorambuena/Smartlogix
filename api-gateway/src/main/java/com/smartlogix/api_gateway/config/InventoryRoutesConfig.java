package com.smartlogix.api_gateway.config;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.rewritePath;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.setRequestHeader;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class InventoryRoutesConfig {

    /*
     * External route:
     * /inventory/products/** -> inventory-service /api/products/**
     */
    @Bean
    @Order(-20)
    public RouterFunction<ServerResponse> inventoryProductsRoute(
            @Value("${gateway.routes.inventory-service-url}") String inventoryServiceUrl,
            @Value("${gateway.routes.inventory-api-key}") String inventoryApiKey) {
        return route("inventory-products")
                .route(path("/inventory/products", "/inventory/products/**"), http())
                .before(uri(inventoryServiceUrl))
                .before(rewritePath("/inventory/products(?<segment>/?.*)", "/api/products${segment}"))
                .before(setRequestHeader("X-API-Key", inventoryApiKey))
                .build();
    }

    /*
     * External route:
     * /inventory/** -> inventory-service /api/inventory/**
     */
    @Bean
    @Order(-10)
    public RouterFunction<ServerResponse> inventoryStockRoute(
            @Value("${gateway.routes.inventory-service-url}") String inventoryServiceUrl,
            @Value("${gateway.routes.inventory-api-key}") String inventoryApiKey) {
        return route("inventory-stock")
                .route(path("/inventory", "/inventory/**"), http())
                .before(uri(inventoryServiceUrl))
                .before(rewritePath("/inventory(?<segment>/?.*)", "/api/inventory${segment}"))
                .before(setRequestHeader("X-API-Key", inventoryApiKey))
                .build();
    }
}
