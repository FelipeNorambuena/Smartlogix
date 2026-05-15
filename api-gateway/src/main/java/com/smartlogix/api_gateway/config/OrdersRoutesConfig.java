package com.smartlogix.api_gateway.config;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.rewritePath;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.setRequestHeader;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

import java.util.List;
import java.util.function.Function;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class OrdersRoutesConfig {

    /*
     * External route:
     * /orders/** -> pedidos-service /api/orders/**
     *
     * El gateway valida JWT y envia claims minimos como headers internos.
     */
    @Bean
    @Order(-8)
    public RouterFunction<ServerResponse> ordersRoute(
            @Value("${gateway.routes.orders-service-url}") String ordersServiceUrl,
            @Value("${gateway.routes.orders-api-key}") String ordersApiKey) {
        return route("orders")
                .route(path("/orders", "/orders/**"), http())
                .before(forwardJwtClaims())
                .before(uri(ordersServiceUrl))
                .before(rewritePath("/orders(?<segment>/?.*)", "/api/orders${segment}"))
                .before(setRequestHeader("X-API-Key", ordersApiKey))
                .build();
    }

    private Function<ServerRequest, ServerRequest> forwardJwtClaims() {
        return request -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
                return request;
            }

            Jwt jwt = jwtAuthentication.getToken();
            ServerRequest.Builder builder = ServerRequest.from(request);
            // Se eliminan headers internos entrantes para que el cliente no pueda suplantar identidad.
            builder.headers(headers -> {
                headers.remove("X-User-Id");
                headers.remove("X-User-Email");
                headers.remove("X-User-Roles");
            });
            addHeaderIfPresent(builder, "X-User-Id", jwt.getClaimAsString("userId"));
            addHeaderIfPresent(builder, "X-User-Email", jwt.getClaimAsString("email"));

            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles != null && !roles.isEmpty()) {
                builder.header("X-User-Roles", String.join(",", roles));
            }
            return builder.build();
        };
    }

    private void addHeaderIfPresent(ServerRequest.Builder builder, String name, String value) {
        if (value != null && !value.isBlank()) {
            builder.header(name, value);
        }
    }
}
