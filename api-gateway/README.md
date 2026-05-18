# SmartLogix API Gateway

Entrada unica para el frontend SmartLogix. Centraliza rutas externas, CORS, validacion JWT y autorizacion inicial por rol.

## Datos principales

| Campo | Valor |
| --- | --- |
| Aplicacion | `api-gateway` |
| Framework | Spring Boot 4.0.6 + Spring Cloud Gateway WebMVC |
| Build tool | Maven |
| Java | 21 |
| Puerto local | `8080` |

## Responsabilidades

- Recibir todas las llamadas externas del frontend.
- Validar JWT emitido por `auth-service`.
- Enrutar solicitudes a `auth-service`, `inventario`, `pedidos` y `envios`.
- Ocultar rutas internas `/api/**` de los microservicios.
- Aplicar CORS para React local.

## Ejecucion

```powershell
cd api-gateway
.\mvnw.cmd spring-boot:run
```

## Pruebas

```powershell
cd api-gateway
.\mvnw.cmd test
```

## Variables relevantes

```properties
SERVER_PORT=8080
AUTH_SERVICE_URL=http://localhost:8082
INVENTORY_SERVICE_URL=http://localhost:8081
ORDERS_SERVICE_URL=http://localhost:8084
SHIPPING_SERVICE_URL=http://localhost:8083
JWT_SECRET=smartlogix-auth-dev-secret-change-me-1234567890
JWT_ISSUER=smartlogix-auth
GATEWAY_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Rutas externas

```text
/auth/**      -> auth-service
/users/**     -> auth-service
/inventory/** -> inventario
/orders/**    -> pedidos
/shipping/**  -> envios
```

## Postman

Coleccion recomendada:

```text
../postman/smartlogix-gateway.postman_collection.json
```
