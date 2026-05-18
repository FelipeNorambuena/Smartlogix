# SmartLogix Auth Service

Microservicio responsable de usuarios, roles, login, registro y generacion de JWT.

## Datos principales

| Campo | Valor |
| --- | --- |
| Aplicacion | `auth-service` |
| Framework | Spring Boot 4.0.6 |
| Build tool | Maven |
| Java | 17 |
| Puerto local | `8082` |
| Base de datos | `smartlogix_auth` |

## Responsabilidades

- Registrar usuarios.
- Validar credenciales.
- Generar tokens JWT.
- Administrar usuarios y roles.
- Responder datos de perfil autenticado.

No debe manejar inventario, pedidos ni envios.

## Base de datos

Ejecutar primero:

```text
../smartlogix_auth_mysql_laragon.sql
```

Las tablas principales se versionan con Flyway:

```text
src/main/resources/db/migration/V1__create_auth_schema.sql
```

## Ejecucion

```powershell
cd auth-service
.\mvnw.cmd spring-boot:run
```

## Pruebas

```powershell
cd auth-service
.\mvnw.cmd test
```

## Variables relevantes

```properties
SERVER_PORT=8082
DB_URL=jdbc:mysql://localhost:3306/smartlogix_auth?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=smartlogix-auth-dev-secret-change-me-1234567890
JWT_ISSUER=smartlogix-auth
JWT_EXPIRATION_MINUTES=120
AUTH_BOOTSTRAP_ADMIN_ENABLED=false
AUTH_BOOTSTRAP_ADMIN_EMAIL=admin@smartlogix.com
AUTH_BOOTSTRAP_ADMIN_PASSWORD=Admin12345
```

## Endpoints principales

```text
POST /auth/register
POST /auth/login
GET  /auth/me
GET  /users
GET  /users/{id}
POST /users
PUT  /users/{id}
PATCH /users/{id}/roles
PATCH /users/{id}/status
POST /auth/password-reset
```

## Postman

Coleccion recomendada:

```text
../postman/smartlogix-auth.postman_collection.json
```
