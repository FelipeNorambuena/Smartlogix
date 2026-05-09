# SmartLogix - API de Envios

Microservicio Spring Boot encargado de administrar envios y eventos de tracking asociados a pedidos.

## Puntos clave implementados

- Se completo el modulo `envios` siguiendo la misma arquitectura usada en `inventario`: `controller`, `service`, `repository`, `model`, `dto`, `exception` y `security`.
- Se agregaron comentarios explicativos en las clases principales para facilitar la lectura del flujo y las responsabilidades de cada capa.
- Se implemento la entidad `Shipment` para guardar el envio asociado a un pedido mediante `orderId`.
- Se implemento la entidad `ShipmentEvent` para guardar el historial de tracking del envio.
- Se agrego validacion de reglas de negocio en `ShipmentService`.
- Se agrego manejo global de errores con respuestas JSON consistentes, igual que en Inventario.
- Se agrego autenticacion interna por `X-API-Key`, desactivable en desarrollo si la clave queda vacia.
- Se agrego migracion Flyway `V1__create_shipping_schema.sql` para crear las tablas `shipments` y `shipment_events`.
- Se agrego configuracion de pruebas con H2 para que el contexto de Spring pueda levantarse sin depender de MySQL.
- Se conecto el microservicio al `api-gateway` mediante la ruta externa `/shipping/**`.
- Se creo una coleccion Postman para probar la API: `postman/smartlogix-envios.postman_collection.json`.

## Endpoints principales

Base local directa del microservicio:

```text
http://localhost:8083
```

Rutas internas del servicio:

```text
GET    /api/shipments
POST   /api/shipments
GET    /api/shipments/{id}
GET    /api/shipments/order/{orderId}
GET    /api/shipments/tracking/{trackingNumber}
GET    /api/shipments/{id}/events
PUT    /api/shipments/{id}
PATCH  /api/shipments/{id}/status
DELETE /api/shipments/{id}
```

Ruta externa por API Gateway:

```text
/shipping/** -> /api/shipments/**
```

## Estados de envio

Estados soportados:

```text
pending
ready_to_ship
in_transit
delivered
failed
returned
cancelled
```

Transiciones principales:

- `pending` puede pasar a `ready_to_ship` o `cancelled`.
- `ready_to_ship` puede pasar a `in_transit` o `cancelled`.
- `in_transit` puede pasar a `delivered`, `failed` o `returned`.
- `failed` puede pasar a `ready_to_ship`, `returned` o `cancelled`.
- `delivered`, `returned` y `cancelled` quedan como estados terminales.

## Variables de configuracion

```properties
SERVER_PORT=8083
DB_URL=jdbc:mysql://localhost:3306/smartlogix?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=
ENVIOS_API_KEY=
ENVIOS_API_KEY_HEADER=X-API-Key
FLYWAY_ENABLED=true
```

Si `ENVIOS_API_KEY` queda vacia, el filtro de API key no se aplica. Para llamadas internas protegidas, usar el mismo valor en `envios` y en `api-gateway`.

## Configuracion agregada al gateway

Propiedades:

```properties
gateway.routes.shipping-service-url=${SHIPPING_SERVICE_URL:http://localhost:8083}
gateway.routes.shipping-api-key=${ENVIOS_API_KEY:local-dev-shipping-key}
```

Seguridad:

```text
/shipping y /shipping/** requieren ADMIN u OPERADOR_ENVIOS
```

## Pruebas

Se ejecuto correctamente:

```text
C:\apache-maven-3.9.15\bin\mvn.cmd test
```

Resultado en `envios`:

```text
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Tambien se ejecuto correctamente en `api-gateway` para validar la nueva ruta de shipping.

## Postman

Coleccion agregada:

```text
postman/smartlogix-envios.postman_collection.json
```

Incluye solicitudes para:

- Listar envios.
- Filtrar por estado o transportista.
- Crear envio.
- Buscar por id, pedido o tracking.
- Actualizar datos logisticos.
- Cambiar estado a `ready_to_ship`, `in_transit` y `delivered`.
- Consultar eventos de tracking.
- Cancelar envio.
