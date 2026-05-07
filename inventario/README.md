# API de Inventario - SmartLogix

Microservicio Spring Boot encargado de administrar productos e inventario de SmartLogix. Expone endpoints REST para crear, consultar, actualizar y desactivar productos, ademas de consultar y mantener el stock asociado a cada producto.

## Datos principales

| Campo | Valor |
| --- | --- |
| Aplicacion | `inventario` |
| Lenguaje | Java 17 |
| Framework | Spring Boot 4.0.6 |
| Build tool | Maven |
| Packaging | Jar |
| Puerto local | `8081` |
| Base URL local | `http://localhost:8081` |
| Base de datos | MySQL/MariaDB, esquema `smartlogix` |
| Documentacion Swagger | `http://localhost:8081/swagger-ui.html` |
| Coleccion Postman | `../postman/smartlogix-inventario.postman_collection.json` |

## Responsabilidad del servicio

La API cubre dos recursos principales:

- `products`: productos vendibles o almacenables.
- `inventory`: stock asociado a productos existentes.

El inventario se administra por `productId`, porque cada producto tiene como maximo una fila de inventario. Los productos usan baja logica: `DELETE /api/products/{id}` marca el producto como inactivo y no elimina la fila fisicamente.

## Stack y dependencias

Dependencias principales definidas en `pom.xml`:

- `spring-boot-starter-webmvc`: API REST.
- `spring-boot-starter-data-jpa`: persistencia JPA/Hibernate.
- `spring-boot-starter-validation`: validacion de requests.
- `springdoc-openapi-starter-webmvc-ui`: Swagger UI.
- `mysql-connector-j`: driver MySQL.
- `flyway-core` y `flyway-mysql`: migraciones versionadas de base de datos.
- `h2`: base de datos embebida para pruebas de integracion JPA.
- `lombok`: soporte de anotaciones en compilacion.
- Dependencias de test para WebMVC, Data JPA y Validation.

## Configuracion local

Archivos:

- `src/main/resources/application.properties`: configuracion comun.
- `src/main/resources/application-dev.properties`: configuracion local con defaults para Laragon/MySQL.
- `src/main/resources/application-prod.properties`: configuracion productiva por variables de entorno.
- `src/test/resources/application-test.properties`: configuracion de pruebas con H2.

Perfil por defecto:

```properties
spring.profiles.default=dev
```

Configuracion comun:

```properties
spring.application.name=${SPRING_APPLICATION_NAME:inventario}
spring.profiles.default=dev
spring.jpa.properties.hibernate.type.preferred_uuid_jdbc_type=CHAR
spring.jpa.open-in-view=false
spring.flyway.enabled=${FLYWAY_ENABLED:true}
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=${FLYWAY_BASELINE_ON_MIGRATE:true}
spring.flyway.validate-on-migrate=${FLYWAY_VALIDATE_ON_MIGRATE:true}
springdoc.swagger-ui.path=${SWAGGER_UI_PATH:/swagger-ui.html}
```

Puntos relevantes:

- El servicio espera MySQL/MariaDB local en `localhost:3306`.
- La base de datos debe llamarse `smartlogix`.
- El usuario configurado es `root` sin password.
- En `dev`, esos valores son defaults y pueden reemplazarse con variables de entorno.
- En `prod`, `DB_URL`, `DB_USERNAME` y `DB_PASSWORD` deben venir desde el entorno.
- `spring.jpa.hibernate.ddl-auto=validate` valida el esquema existente; no crea ni modifica tablas automaticamente.
- Flyway ejecuta migraciones desde `src/main/resources/db/migration`.
- `FLYWAY_BASELINE_ON_MIGRATE=true` permite incorporar bases existentes creadas con el script SQL anterior.
- Los UUID se persisten como `CHAR`.

Variables soportadas:

| Variable | Uso | Default en `dev` |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | Perfil activo. | `dev` por `spring.profiles.default` |
| `SERVER_PORT` | Puerto HTTP. | `8081` |
| `DB_URL` | URL JDBC. | `jdbc:mysql://localhost:3306/smartlogix?...` |
| `DB_USERNAME` | Usuario de BD. | `root` |
| `DB_PASSWORD` | Password de BD. | vacio |
| `DB_DRIVER` | Driver JDBC. | `com.mysql.cj.jdbc.Driver` |
| `JPA_DDL_AUTO` | Modo Hibernate DDL. | `validate` |
| `JPA_DIALECT` | Dialecto Hibernate. | `org.hibernate.dialect.MySQLDialect` |
| `JPA_TIME_ZONE` | Zona horaria JDBC. | `UTC` |
| `FLYWAY_ENABLED` | Activa/desactiva Flyway. | `true` |
| `FLYWAY_BASELINE_ON_MIGRATE` | Baseline automatico si el esquema ya existe. | `true` |
| `FLYWAY_VALIDATE_ON_MIGRATE` | Valida migraciones al iniciar. | `true` |
| `INVENTARIO_API_KEY` | API key requerida para rutas `/api/**` cuando esta configurada. | vacio, seguridad desactivada |
| `INVENTARIO_API_KEY_HEADER` | Nombre del header de API key. | `X-API-Key` |
| `SWAGGER_UI_PATH` | Ruta Swagger UI. | `/swagger-ui.html` |

## Seguridad

La API usa autenticacion simple por API key para llamadas internas.

Header por defecto:

```text
X-API-Key: <valor-de-INVENTARIO_API_KEY>
```

Comportamiento:

- En `dev`, si `INVENTARIO_API_KEY` esta vacia, el filtro queda desactivado.
- En `prod`, `INVENTARIO_API_KEY` debe estar definida.
- Las rutas protegidas son las que comienzan con `/api/`.
- Swagger y otros recursos fuera de `/api/` no requieren API key.
- Si la clave falta o es invalida, responde `401 Unauthorized` con formato JSON.

## Base de datos

La migracion versionada principal esta en:

```text
src/main/resources/db/migration/V1__create_inventory_schema.sql
```

El script general del proyecto sigue disponible en:

```text
../smartlogix_mysql_laragon.sql
```

Para una base nueva, Flyway puede crear las tablas propias de inventario automaticamente al iniciar el servicio. Para una base compartida ya creada con el script general, `baseline-on-migrate` permite registrar el baseline sin volver a aplicar `V1`.

El script general esta pensado para Laragon con HeidiSQL, pero tambien puede ejecutarse en cualquier cliente MySQL/MariaDB compatible.

Tablas usadas por esta API:

### `products`

| Columna | Tipo | Descripcion |
| --- | --- | --- |
| `id` | `VARCHAR(36)` | UUID del producto. |
| `sku` | `VARCHAR(255)` | Codigo comercial unico. |
| `name` | `VARCHAR(255)` | Nombre del producto. |
| `description` | `VARCHAR(255)` | Descripcion opcional. |
| `unit_price` | `DECIMAL(12,2)` | Precio unitario, no negativo. |
| `category` | `VARCHAR(255)` | Categoria opcional. |
| `is_active` | `BIT` | Estado activo/inactivo para baja logica. |
| `legacy_product_id` | `INT` | Referencia opcional a sistema antiguo. |
| `created_at` | `DATETIME(6)` | Fecha de creacion. |
| `updated_at` | `DATETIME(6)` | Fecha de ultima actualizacion. |

### `inventory`

| Columna | Tipo | Descripcion |
| --- | --- | --- |
| `id` | `VARCHAR(36)` | UUID interno de inventario. |
| `product_id` | `VARCHAR(36)` | Producto asociado. Es unico. |
| `stock_available` | `INT` | Stock disponible total. |
| `stock_reserved` | `INT` | Stock reservado. |
| `warehouse_location` | `VARCHAR(255)` | Ubicacion de bodega opcional. |
| `reorder_point` | `INT` | Punto de reposicion. |
| `legacy_inventory_id` | `INT` | Referencia opcional a sistema antiguo. |
| `created_at` | `DATETIME(6)` | Fecha de creacion. |
| `updated_at` | `DATETIME(6)` | Fecha de ultima actualizacion. |

Restricciones principales:

- `products.sku` es unico.
- `inventory.product_id` es unico.
- `inventory.product_id` referencia a `products.id`.
- `stock_available >= 0`.
- `stock_reserved >= 0`.
- `reorder_point >= 0`.
- `stock_reserved <= stock_available`.
- `unit_price >= 0`.

## Como ejecutar

Desde la carpeta `inventario`:

```powershell
.\mvnw.cmd spring-boot:run
```

En Linux/macOS:

```bash
./mvnw spring-boot:run
```

Verificar que el servicio inicio correctamente:

```powershell
curl.exe http://localhost:8081/api/products
```

## Como ejecutar pruebas

Desde la carpeta `inventario`:

```powershell
.\mvnw.cmd test
```

Las pruebas cubren controllers con MockMvc y services con Mockito.
Tambien incluyen integracion JPA con H2 para validar repositorios, mapeos, relacion producto-inventario, callbacks de fechas y consulta con bloqueo pesimista.

## Endpoints

### Productos

Base path:

```text
/api/products
```

| Metodo | Ruta | Descripcion | Respuesta exitosa |
| --- | --- | --- | --- |
| `GET` | `/api/products` | Lista productos activos con filtros y paginacion. | `200 OK` |
| `GET` | `/api/products/{id}` | Busca producto por UUID. | `200 OK` |
| `GET` | `/api/products/sku/{sku}` | Busca producto por SKU. | `200 OK` |
| `POST` | `/api/products` | Crea un producto. | `201 Created` |
| `PUT` | `/api/products/{id}` | Actualiza un producto. | `200 OK` |
| `DELETE` | `/api/products/{id}` | Desactiva un producto por baja logica. | `204 No Content` |

### Inventario

Base path:

```text
/api/inventory
```

| Metodo | Ruta | Descripcion | Respuesta exitosa |
| --- | --- | --- | --- |
| `GET` | `/api/inventory` | Lista inventario con filtros y paginacion. | `200 OK` |
| `GET` | `/api/inventory/{productId}` | Busca inventario por UUID de producto. | `200 OK` |
| `GET` | `/api/inventory/{productId}/stock` | Consulta disponibilidad resumida de stock. | `200 OK` |
| `GET` | `/api/inventory/{productId}/availability?quantity={quantity}` | Valida si existe stock libre suficiente para una cantidad. | `200 OK` |
| `PUT` | `/api/inventory/{productId}` | Crea o actualiza el inventario del producto. | `200 OK` |
| `POST` | `/api/inventory/{productId}/reserve` | Reserva stock para un pedido pendiente. | `200 OK` |
| `POST` | `/api/inventory/{productId}/release` | Libera stock reservado. | `200 OK` |
| `POST` | `/api/inventory/{productId}/confirm` | Confirma una reserva y descuenta stock total. | `200 OK` |

## Contratos de productos

### Crear producto

`POST /api/products`

Request:

```json
{
  "sku": "SLX-999",
  "name": "Producto test",
  "description": "Descripcion del producto",
  "unitPrice": 12990,
  "category": "Categoria"
}
```

Validaciones:

| Campo | Reglas |
| --- | --- |
| `sku` | Obligatorio, no vacio. Se normaliza con `trim()` y mayusculas. Debe ser unico. |
| `name` | Obligatorio, no vacio. Se guarda con `trim()`. |
| `description` | Opcional. Si llega vacio se guarda como `null`. |
| `unitPrice` | Obligatorio, mayor o igual a `0.00`. |
| `category` | Opcional. Si llega vacio se guarda como `null`. |

Response `201 Created`:

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "sku": "SLX-999",
  "name": "Producto test",
  "description": "Descripcion del producto",
  "unitPrice": 12990,
  "category": "Categoria",
  "active": true,
  "createdAt": "2026-05-07T16:00:00Z",
  "updatedAt": "2026-05-07T16:00:00Z"
}
```

### Actualizar producto

`PUT /api/products/{id}`

Request:

```json
{
  "sku": "SLX-999",
  "name": "Producto test actualizado",
  "description": "Nueva descripcion",
  "unitPrice": 13990,
  "category": "Categoria",
  "active": true
}
```

Validaciones:

- `sku`, `name` y `unitPrice` son obligatorios.
- `sku` no puede existir en otro producto.
- `active` es opcional. Si viene `null`, no cambia el estado actual.

Response `200 OK`: mismo formato de `ProductResponse`.

### Consultar productos

Listar activos:

```powershell
curl.exe "http://localhost:8081/api/products?page=0&size=20"
```

Filtros disponibles:

| Parametro | Descripcion |
| --- | --- |
| `sku` | Filtra productos activos por coincidencia parcial de SKU. |
| `name` | Filtra por coincidencia parcial de nombre. |
| `category` | Filtra por coincidencia parcial de categoria. |
| `page` | Numero de pagina, inicia en `0`. Default: `0`. |
| `size` | Cantidad por pagina. Default: `20`, maximo: `100`. |

Response paginada:

```json
{
  "content": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "sku": "SLX-999",
      "name": "Producto test",
      "description": "Descripcion del producto",
      "unitPrice": 12990,
      "category": "Categoria",
      "active": true,
      "createdAt": "2026-05-07T16:00:00Z",
      "updatedAt": "2026-05-07T16:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

Buscar por ID:

```powershell
curl.exe http://localhost:8081/api/products/{id}
```

Buscar por SKU:

```powershell
curl.exe http://localhost:8081/api/products/sku/SLX-999
```

### Eliminar producto

`DELETE /api/products/{id}`

La operacion no elimina la fila fisicamente. Solo marca `active=false`.

Response:

```text
204 No Content
```

## Contratos de inventario

### Crear o actualizar inventario

`PUT /api/inventory/{productId}`

Request:

```json
{
  "stockAvailable": 20,
  "stockReserved": 5,
  "warehouseLocation": "Santiago",
  "reorderPoint": 3
}
```

Los valores representan cantidades absolutas, no incrementos.

Validaciones:

| Campo | Reglas |
| --- | --- |
| `stockAvailable` | Obligatorio, mayor o igual a `0`. |
| `stockReserved` | Obligatorio, mayor o igual a `0` y no puede superar `stockAvailable`. |
| `warehouseLocation` | Opcional. Si llega vacio se guarda como `null`. |
| `reorderPoint` | Obligatorio, mayor o igual a `0`. |

Response `200 OK`:

```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "productId": "00000000-0000-0000-0000-000000000000",
  "sku": "SLX-999",
  "productName": "Producto test",
  "stockAvailable": 20,
  "stockReserved": 5,
  "warehouseLocation": "Santiago",
  "reorderPoint": 3,
  "createdAt": "2026-05-07T16:00:00Z",
  "updatedAt": "2026-05-07T16:00:00Z"
}
```

### Consultar inventario

Listar inventario:

```powershell
curl.exe "http://localhost:8081/api/inventory?page=0&size=20"
```

Filtros disponibles:

| Parametro | Descripcion |
| --- | --- |
| `sku` | Filtra inventario por coincidencia parcial de SKU del producto. |
| `warehouseLocation` | Filtra por coincidencia parcial de ubicacion de bodega. |
| `lowStock` | `true` para productos con `stockAvailable <= reorderPoint`; `false` para el resto. |
| `page` | Numero de pagina, inicia en `0`. Default: `0`. |
| `size` | Cantidad por pagina. Default: `20`, maximo: `100`. |

Buscar inventario por producto:

```powershell
curl.exe http://localhost:8081/api/inventory/{productId}
```

Consultar stock resumido:

```powershell
curl.exe http://localhost:8081/api/inventory/{productId}/stock
```

Consultar disponibilidad para una cantidad:

```powershell
curl.exe "http://localhost:8081/api/inventory/{productId}/availability?quantity=4"
```

Response de stock:

```json
{
  "productId": "00000000-0000-0000-0000-000000000000",
  "sku": "SLX-999",
  "productName": "Producto test",
  "stockAvailable": 20,
  "stockReserved": 5,
  "stockFree": 15,
  "warehouseLocation": "Santiago",
  "belowReorderPoint": false
}
```

Calculos:

- `stockFree = stockAvailable - stockReserved`.
- `belowReorderPoint = stockAvailable <= reorderPoint`.

Response de disponibilidad:

```json
{
  "productId": "00000000-0000-0000-0000-000000000000",
  "sku": "SLX-999",
  "productName": "Producto test",
  "requestedQuantity": 4,
  "stockAvailable": 20,
  "stockReserved": 5,
  "stockFree": 15,
  "warehouseLocation": "Santiago",
  "productActive": true,
  "available": true
}
```

### Operaciones transaccionales de stock

Estas rutas estan pensadas para integrarse con la API de pedidos. A diferencia de `PUT /api/inventory/{productId}`, no reciben valores absolutos: reciben una cantidad de unidades a operar.

Request comun:

```json
{
  "quantity": 4
}
```

Validaciones:

| Campo | Reglas |
| --- | --- |
| `quantity` | Obligatorio, mayor o igual a `1`. |

#### Reservar stock

`POST /api/inventory/{productId}/reserve`

Reserva unidades para un pedido pendiente. Aumenta `stockReserved` y no modifica `stockAvailable`.

Reglas:

- El producto debe existir.
- El inventario del producto debe existir.
- El producto debe estar activo.
- `quantity` no puede superar `stockFree`.
- La fila de inventario se bloquea durante la operacion con bloqueo pesimista para evitar sobre-reservas concurrentes.

#### Liberar stock reservado

`POST /api/inventory/{productId}/release`

Libera unidades reservadas cuando un pedido se cancela o expira. Disminuye `stockReserved` y no modifica `stockAvailable`.

Reglas:

- `quantity` no puede superar `stockReserved`.
- La fila de inventario se bloquea durante la operacion.

#### Confirmar stock reservado

`POST /api/inventory/{productId}/confirm`

Confirma una venta ya reservada. Disminuye `stockReserved` y tambien descuenta `stockAvailable`.

Reglas:

- `quantity` no puede superar `stockReserved`.
- La fila de inventario se bloquea durante la operacion.

Response comun para operaciones:

```json
{
  "productId": "00000000-0000-0000-0000-000000000000",
  "sku": "SLX-999",
  "productName": "Producto test",
  "stockAvailable": 20,
  "stockReserved": 9,
  "stockFree": 11,
  "warehouseLocation": "Santiago",
  "belowReorderPoint": false
}
```

## Formato de errores

La API usa un contrato JSON unico para errores:

```json
{
  "timestamp": "2026-05-07T16:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "La solicitud contiene datos invalidos",
  "path": "/api/products",
  "details": {
    "sku": "must not be blank"
  }
}
```

Codigos manejados:

| Codigo | Causa |
| --- | --- |
| `400 Bad Request` | Validaciones de DTO o reglas de negocio incumplidas. |
| `404 Not Found` | Producto o inventario inexistente. |
| `405 Method Not Allowed` | Metodo HTTP no soportado por la ruta. |
| `409 Conflict` | Violacion de restricciones de integridad en base de datos. |
| `415 Unsupported Media Type` | `Content-Type` no soportado. |
| `500 Internal Server Error` | Error inesperado. |
| `401 Unauthorized` | API key invalida o ausente cuando la seguridad esta activa. |

Ejemplos de reglas de negocio que devuelven `400`:

- SKU duplicado: `Ya existe un producto con SKU SLX-001`.
- Stock disponible negativo.
- Stock reservado negativo.
- Punto de reposicion negativo.
- Stock reservado mayor que stock disponible.
- Cantidad de operacion menor que `1`.
- Stock insuficiente para reservar.
- Intento de liberar o confirmar mas stock del reservado.
- Intento de reservar stock de un producto inactivo.

Ejemplos de `404`:

- `Producto no encontrado con id {id}`.
- `Producto no encontrado para SKU {sku}`.
- `Inventario no encontrado para producto {productId}`.

Otros errores normalizados:

- API key faltante o invalida: `API key invalida o ausente`.
- UUID invalido en path: `Parametro invalido`.
- Query param obligatorio omitido: `Falta un parametro requerido`.
- JSON mal formado: `JSON de solicitud invalido o mal formado`.
- Restricciones de BD: `La solicitud viola restricciones de integridad de datos`.
- Fallback inesperado: `Error interno del servidor`.

## Reglas de negocio

- Solo se listan productos activos en `GET /api/products`.
- El SKU se normaliza a mayusculas y sin espacios externos.
- No se permiten SKU duplicados.
- El borrado de productos es baja logica.
- El inventario depende de un producto existente.
- Si el producto existe y no tiene inventario, `PUT /api/inventory/{productId}` crea la fila.
- `stockReserved` no puede superar `stockAvailable`.
- Las operaciones de reserva, liberacion y confirmacion trabajan con cantidades incrementales.
- Reservar stock aumenta `stockReserved` y no modifica `stockAvailable`.
- Liberar stock disminuye `stockReserved` y no modifica `stockAvailable`.
- Confirmar stock reservado disminuye `stockReserved` y `stockAvailable`.
- Las operaciones que modifican stock usan bloqueo pesimista sobre la fila de inventario.
- Los listados paginados aceptan `page >= 0` y `1 <= size <= 100`.
- `description`, `category` y `warehouseLocation` se guardan como `null` si llegan vacios.
- La API no tiene autenticacion configurada en el codigo actual.

## Estructura del proyecto

```text
inventario/
  pom.xml
  mvnw
  mvnw.cmd
  src/
    main/
      java/com/api/inventario/
        InventarioApplication.java
        controller/
          ProductController.java
          InventoryController.java
        dto/
          PageResponse.java
          ProductCreateRequest.java
          ProductUpdateRequest.java
          ProductResponse.java
          InventoryUpdateRequest.java
          InventoryResponse.java
          StockAvailabilityResponse.java
          StockOperationRequest.java
          StockResponse.java
        exception/
          ApiErrorResponse.java
          BusinessRuleException.java
          GlobalExceptionHandler.java
          ResourceNotFoundException.java
        model/
          Product.java
          Inventory.java
        repository/
          ProductRepository.java
          InventoryRepository.java
        security/
          ApiKeyAuthFilter.java
        service/
          ProductService.java
          InventoryService.java
      resources/
        application.properties
        application-dev.properties
        application-prod.properties
        db/migration/
          V1__create_inventory_schema.sql
    test/
      resources/
        application-test.properties
      java/com/api/inventario/
        controller/
        repository/
        service/
```

## Swagger y Postman

Swagger UI:

```text
http://localhost:8081/swagger-ui.html
```

Coleccion Postman:

```text
../postman/smartlogix-inventario.postman_collection.json
```

Variables de la coleccion:

| Variable | Valor por defecto |
| --- | --- |
| `baseUrl` | `http://localhost:8081` |
| `productId` | `00000000-0000-0000-0000-000000000000` |
| `sku` | `SLX-999` |
| `quantity` | `4` |

## Flujo minimo recomendado para probar

1. Ejecutar `../smartlogix_mysql_laragon.sql` en MySQL/MariaDB.
2. Iniciar la API con `.\mvnw.cmd spring-boot:run`.
3. Crear un producto con `POST /api/products`.
4. Copiar el `id` retornado.
5. Crear inventario con `PUT /api/inventory/{productId}`.
6. Consultar disponibilidad con `GET /api/inventory/{productId}/availability?quantity=4`.
7. Reservar stock con `POST /api/inventory/{productId}/reserve`.
8. Confirmar la reserva con `POST /api/inventory/{productId}/confirm` o liberarla con `POST /api/inventory/{productId}/release`.
