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
public class ShippingRoutesConfig {

    /*
     * External route:
     * /shipping/** -> envios-service /api/shipments/**
     */
    @Bean
    @Order(-5)
    public RouterFunction<ServerResponse> shippingRoute(
            @Value("${gateway.routes.shipping-service-url}") String shippingServiceUrl,
            @Value("${gateway.routes.shipping-api-key}") String shippingApiKey) {
        return route("shipping")
                .route(path("/shipping", "/shipping/**"), http())
                .before(uri(shippingServiceUrl))
                .before(rewritePath("/shipping(?<segment>/?.*)", "/api/shipments${segment}"))
                .before(setRequestHeader("X-API-Key", shippingApiKey))
                .build();
    }
}
