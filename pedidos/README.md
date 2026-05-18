# SmartLogix Pedidos Service

Microservicio responsable de creacion, validacion, consulta y actualizacion de pedidos.

## Datos principales

| Campo | Valor |
| --- | --- |
| Aplicacion | `pedidos` |
| Framework | Spring Boot 4.0.6 |
| Build tool | Maven |
| Java | 17 |
| Puerto local | `8084` |
| Base de datos | `smartlogix_orders` |

## Responsabilidades

- Crear pedidos.
- Validar disponibilidad de stock en `inventario`.
- Reservar, liberar o confirmar stock segun estado del pedido.
- Consultar usuario cliente en `auth-service` cuando corresponde.
- Gestionar estados del pedido.
- Entregar trazabilidad basica de ordenes.

No debe administrar usuarios, login, inventario interno ni envios.

## Base de datos

Ejecutar primero:

```text
../smartlogix_orders_mysql_laragon.sql
```

Migracion Flyway:

```text
src/main/resources/db/migration/V1__create_orders_schema.sql
```

## Ejecucion

```powershell
cd pedidos
.\mvnw.cmd spring-boot:run
```

## Pruebas

```powershell
cd pedidos
.\mvnw.cmd test
```

## Variables relevantes

```properties
SERVER_PORT=8084
DB_URL=jdbc:mysql://localhost:3306/smartlogix_orders?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=
INVENTORY_SERVICE_URL=http://localhost:8081
INVENTARIO_API_KEY=
AUTH_SERVICE_URL=http://localhost:8082
PEDIDOS_API_KEY=
PEDIDOS_API_KEY_HEADER=X-API-Key
```

## Integraciones

| Integracion | Cliente | Resiliencia |
| --- | --- | --- |
| `pedidos` -> `inventario` | `InventoryClient` | Circuit Breaker |
| `pedidos` -> `auth-service` | `AuthUserClient` | Circuit Breaker |

## Endpoints principales

```text
GET   /api/orders
GET   /api/orders/{id}
POST  /api/orders
PATCH /api/orders/{id}/status
GET   /api/orders/customer/{customerId}
```

## Postman

Coleccion recomendada:

```text
../postman/smartlogix-pedidos.postman_collection.json
```
