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
