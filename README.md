# Smartlogix

Apis Envios - Pedidos - Inventario  contienen dependencias:
 - Spring WEB 
 - Swagger 
 - Spring DataJPA 
 - MySQL Driver 
 - Validation 
 - Lombook 

 Proyecto en Maven, Lenguage JAVA, Spring boor version 4.0.6, Packinging Jar, configuration in properties, Java 17 (jdk)

## Base de datos local con Laragon

El script para crear las tablas en MySQL/MariaDB esta en `smartlogix_mysql_laragon.sql`.
Esta pensado para ejecutarse desde HeidiSQL conectado al MySQL local de Laragon.

### auth-service

`auth-service` usa una base de datos propia llamada `smartlogix_auth`, porque la arquitectura del proyecto separa la base de datos por microservicio.

Antes de levantar `auth-service`, ejecutar en HeidiSQL:

```sql
smartlogix_auth_mysql_laragon.sql
```

Ese script solo crea la base de datos. Las tablas de autenticacion (`users`, `roles`, `user_roles`) las crea Flyway automaticamente al iniciar el servicio, usando la migracion:

```text
auth-service/src/main/resources/db/migration/V1__create_auth_schema.sql
```

Configuracion local esperada:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartlogix_auth?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
```

Si aparece el error `Unknown database 'smartlogix_auth'`, significa que falta ejecutar `smartlogix_auth_mysql_laragon.sql` en Laragon/HeidiSQL.

### Pruebas de auth con Postman

La coleccion de Postman para probar `auth-service` esta en:

```text
postman/smartlogix-auth.postman_collection.json
```

Orden recomendado:

1. Ejecutar `Health`.
2. Ejecutar `Registrar cliente`.
3. Ejecutar `Perfil actual`.
4. Para probar `/users/**`, iniciar sesion con `Login ADMIN`.
5. Ejecutar las solicitudes de `Users - ADMIN`.

La coleccion guarda automaticamente el JWT en la variable `authToken` despues de registrar o hacer login.

Para crear el primer ADMIN en ambiente local, levantar `auth-service` una vez con:

```properties
AUTH_BOOTSTRAP_ADMIN_ENABLED=true
AUTH_BOOTSTRAP_ADMIN_EMAIL=admin@smartlogix.com
AUTH_BOOTSTRAP_ADMIN_PASSWORD=Admin12345
```

Despues de crear el ADMIN, volver `AUTH_BOOTSTRAP_ADMIN_ENABLED` a `false` para evitar altas administrativas no deseadas.

## API Gateway local

El `api-gateway` centraliza el acceso externo y valida el JWT emitido por `auth-service`.

Configuracion local:

```properties
server.port=8080
AUTH_SERVICE_URL=http://localhost:8082
JWT_SECRET=smartlogix-auth-dev-secret-change-me-1234567890
JWT_ISSUER=smartlogix-auth
INVENTARIO_API_KEY=local-dev-inventory-key
```

`JWT_SECRET` y `JWT_ISSUER` deben coincidir con los valores usados por `auth-service`.

Rutas habilitadas inicialmente:

```text
POST /auth/register -> auth-service
POST /auth/login    -> auth-service
GET  /auth/me       -> auth-service, requiere JWT
/users/**           -> auth-service, requiere rol ADMIN
/inventory/products -> inventario /api/products, requiere ADMIN u OPERADOR_INVENTARIO
/inventory/**       -> inventario /api/inventory, requiere ADMIN u OPERADOR_INVENTARIO
/shipping/**        -> envios /api/shipments, requiere ADMIN u OPERADOR_ENVIOS
```

Orden recomendado para probar:

1. Levantar `auth-service` en `http://localhost:8082`.
2. Levantar `api-gateway` en `http://localhost:8080`.
3. Importar en Postman:

```text
postman/smartlogix-gateway.postman_collection.json
```

4. Ejecutar `Gateway Health`.
5. Ejecutar `Auth por Gateway / Login ADMIN`.
6. Ejecutar `Users por Gateway - ADMIN / Listar usuarios`.
7. Levantar `inventario` en `http://localhost:8081`.
8. Ejecutar `Inventario por Gateway - ADMIN u OPERADOR_INVENTARIO / Listar productos`.
9. Ejecutar `Inventario por Gateway - ADMIN u OPERADOR_INVENTARIO / Crear producto`.
10. Levantar `envios` en `http://localhost:8083`.
11. Probar envios desde `http://localhost:8080/shipping`.

Las rutas externas del Gateway no exponen el prefijo interno `/api` de inventario:

```text
GET  http://localhost:8080/inventory/products
POST http://localhost:8080/inventory/products
GET  http://localhost:8080/inventory
PUT  http://localhost:8080/inventory/{productId}
GET  http://localhost:8080/shipping
POST http://localhost:8080/shipping
PATCH http://localhost:8080/shipping/{shipmentId}/status
```

En desarrollo local, `inventario` permite llamadas sin `X-API-Key` si `INVENTARIO_API_KEY` esta vacio. Si se activa esa clave interna, usar el mismo valor de `INVENTARIO_API_KEY` al levantar `inventario` y `api-gateway`, porque el Gateway la reenvia hacia inventario como `X-API-Key`.
