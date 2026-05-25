# SmartLogix - Defensa Oral Y Evidencia Tecnica

## Presentacion Del Proyecto

SmartLogix es una plataforma para la gestion logistica de eCommerce orientada a
PYMEs. La solucion integra autenticacion, inventario, pedidos y envios mediante
un frontend React, un API Gateway y microservicios Spring Boot con persistencia
independiente en MySQL.

La defensa presenta, en primer lugar, el flujo funcional ejecutado en entorno
local y, posteriormente, la evidencia tecnica que sustenta las decisiones de
arquitectura, patrones de diseno, calidad de codigo y control de versiones.

## Equipo De Desarrollo

| Integrante | Area principal presentada | Responsabilidad tecnica |
| --- | --- | --- |
| Felipe Norambuena | Inventario y arquitectura | Productos, stock, generacion de SKU y patrones |
| Matias Vega | Pedidos | Creacion de ordenes, validacion y reserva de stock |
| Nicolas Olivares | Envios | Despachos, tracking y eventos de seguimiento |
| Juan Pablo Gonzalez | Autenticacion y seguridad | Usuarios, roles, JWT y autorizacion del Gateway |

## Agenda De La Defensa

| Lamina | Contenido | Responsable | Evidencia presentada |
| --- | --- | --- | --- |
| 1 | Problema y objetivo de SmartLogix | Felipe | Contexto y alcance del sistema |
| 2 | Ejecucion funcional en `localhost` | Felipe | Frontend y componentes backend |
| 3 | Login, JWT y control de acceso | Juan Pablo | Autenticacion y roles |
| 4 | Gestion de inventario | Felipe | Productos, SKU y stock |
| 5 | Gestion de pedidos | Matias | Orden y consulta a inventario |
| 6 | Gestion de envios | Nicolas | Despacho y trazabilidad |
| 7 | Arquitectura de la solucion | Felipe / Juan Pablo | Microservicios y BFF ligero |
| 8 | Patrones de diseno aplicados | Equipo | Codigo asociado a cada patron |
| 9 | Calidad y versionamiento | Matias / Nicolas | Pruebas backend e historial Git |
| 10 | Reflexiones y evolucion futura | Equipo | Resultados y oportunidades de mejora |

## 1. Problema Y Objetivo

SmartLogix responde a la necesidad de gestionar de forma coherente el ciclo
logistico de una venta: usuario, disponibilidad de productos, registro del
pedido y despacho. La plataforma evita concentrar todas las responsabilidades
en un unico componente y asigna cada dominio a un servicio independiente.

**Idea central a exponer:**

> SmartLogix reemplaza una gestion fragmentada por una solucion modular,
> mantenible y preparada para integrar nuevos procesos logisticos.

## 2. Demostracion Funcional En Entorno Local

La demostracion inicia desde la interfaz React, que consume las rutas externas
expuestas por el API Gateway.

```text
React Frontend :5173
        |
API Gateway / BFF ligero :8080
        |
        +-- auth-service :8082      -> BD smartlogix_auth
        +-- inventario   :8081      -> BD smartlogix
        +-- pedidos      :8084      -> BD smartlogix_orders
        +-- envios       :8083      -> BD smartlogix_shipping
```

### Recorrido Funcional

| Orden | Operacion demostrada | Responsable | Resultado esperado |
| --- | --- | --- | --- |
| 1 | Acceso a `http://localhost:5173` | Felipe | Interfaz React disponible |
| 2 | Inicio de sesion de usuario autorizado | Juan Pablo | Sesion activa y modulos habilitados |
| 3 | Consulta o creacion de producto | Felipe | Producto disponible con SKU |
| 4 | Verificacion de stock | Felipe | Disponibilidad para generar pedido |
| 5 | Creacion y consulta de pedido | Matias | Orden registrada con sus items |
| 6 | Creacion de envio asociado | Nicolas | Despacho vinculado al pedido |
| 7 | Actualizacion de seguimiento | Nicolas | Estado o evento de tracking registrado |

## 3. Autenticacion, JWT Y Roles

El `auth-service` concentra las responsabilidades de registro, login, usuarios,
roles y emision del JWT. El API Gateway valida el token recibido desde React y
aplica el primer nivel de autorizacion antes de enrutar una solicitud.

El token generado incluye `userId`, `email`, `roles`, fecha de emision y fecha
de expiracion. Este contrato permite autorizar accesos sin compartir la base de
datos de usuarios con los servicios de negocio.

### Codigo Para Mostrar

- [JwtService.java - creacion de token y claims](../auth-service/src/main/java/com/smartlogix/auth/service/JwtService.java#L36)
- [SecurityConfig.java - autorizacion por rutas y roles](../api-gateway/src/main/java/com/smartlogix/api_gateway/config/SecurityConfig.java#L30)
- [apiClient.js - envio del bearer token desde React](../smartlogix-frontend/Front-Smartlogix/src/services/apiClient.js#L11)

### Evidencia A Destacar

| Responsabilidad | Componente |
| --- | --- |
| Generacion de JWT | `auth-service` |
| Extraccion de roles y autorizacion inicial | `api-gateway` |
| Envio del token en solicitudes | Frontend React |
| Persistencia de usuarios y roles | Base de datos propia de autenticacion |

## 4. Gestion De Inventario

El microservicio `inventario` administra productos, stock y disponibilidad. La
regla de generacion automatica del SKU se mantiene en backend mediante un
componente dedicado, evitando trasladar una regla de negocio a la interfaz.

### Codigo Para Mostrar

- [ProductController.java - API REST y delegacion al servicio](../inventario/src/main/java/com/api/inventario/controller/ProductController.java#L67)
- [ProductService.java - creacion de producto y seleccion de SKU](../inventario/src/main/java/com/api/inventario/service/ProductService.java#L87)
- [SkuFactory.java - generacion centralizada del SKU](../inventario/src/main/java/com/api/inventario/factory/SkuFactory.java#L17)
- [ProductRepository.java - persistencia de productos](../inventario/src/main/java/com/api/inventario/repository/ProductRepository.java#L17)

### Decision Tecnica

| Problema | Decision aplicada | Beneficio |
| --- | --- | --- |
| Evitar SKU duplicados o generados inconsistentemente | Centralizar la creacion del SKU en backend | Regla unica, mantenible y comprobable |
| Separar acceso a datos de reglas de producto | Usar repositories Spring Data JPA | Servicios mas claros y testeables |
| Evitar exponer modelos persistidos | Usar DTOs de request/response | Contrato API controlado |

## 5. Gestion De Pedidos

El microservicio `pedidos` registra ordenes y administra sus estados. Para
validar disponibilidad y reservar stock, consume el servicio de inventario a
traves de HTTP REST y DTOs, sin acceder directamente a su base de datos.

Durante la creacion de un pedido, la logica resuelve productos, valida stock,
reserva unidades y persiste la orden. Si ocurre una falla luego de una reserva,
el servicio intenta liberar el stock previamente reservado como compensacion.

### Codigo Para Mostrar

- [OrderService.java - creacion de pedido y reserva de stock](../pedidos/src/main/java/com/api/pedidos/service/OrderService.java#L108)
- [InventoryClient.java - integracion REST con inventario](../pedidos/src/main/java/com/api/pedidos/client/InventoryClient.java#L44)
- [InventoryClient.java - ejecucion protegida por Circuit Breaker](../pedidos/src/main/java/com/api/pedidos/client/InventoryClient.java#L99)
- [InventoryClientConfig.java - configuracion del Circuit Breaker](../pedidos/src/main/java/com/api/pedidos/config/InventoryClientConfig.java#L37)

### Decision Tecnica

| Problema | Decision aplicada | Beneficio |
| --- | --- | --- |
| Validar stock sin compartir tablas | Cliente REST hacia inventario | Independencia entre dominios |
| Fallas temporales de inventario | Circuit Breaker con Resilience4j | Error controlado y menor propagacion de fallas |
| Reserva parcial ante error posterior | Liberacion compensatoria | Reduce inconsistencias operacionales |

## 6. Gestion De Envios

El microservicio `envios` administra despachos, tracking y eventos de
seguimiento. Antes de registrar un envio, consulta el pedido asociado para
validar que se encuentre en estado compatible con despacho.

La trazabilidad se conserva mediante eventos relacionados al envio, permitiendo
mostrar el historial de cambios relevantes y no solamente su ultimo estado.

### Codigo Para Mostrar

- [ShipmentService.java - creacion y validacion del envio](../envios/src/main/java/com/api/envios/service/ShipmentService.java#L131)
- [ShipmentService.java - registro de eventos de tracking](../envios/src/main/java/com/api/envios/service/ShipmentService.java#L234)
- [OrdersClient.java - consulta REST hacia pedidos](../envios/src/main/java/com/api/envios/client/OrdersClient.java#L47)
- [OrdersClientConfig.java - Circuit Breaker para pedidos](../envios/src/main/java/com/api/envios/config/OrdersClientConfig.java#L34)

### Decision Tecnica

| Problema | Decision aplicada | Beneficio |
| --- | --- | --- |
| Validar orden antes de despachar | Consulta REST al servicio de pedidos | Evita envios sin pedido valido |
| Consultar historial logistico | Registro de eventos de seguimiento | Trazabilidad del despacho |
| Indisponibilidad de pedidos | Circuit Breaker | Fallas tratadas de manera controlada |

## 7. Arquitectura Y Patrones Arquitectonicos

SmartLogix aplica una arquitectura basada en microservicios y un API Gateway
como entrada unica para el frontend. Cada microservicio mantiene una base de
datos propia y se comunica con otros servicios por contratos HTTP mediante
DTOs.

El Gateway opera como **BFF ligero**: su interfaz externa esta orientada a React,
adapta rutas, valida JWT y controla roles. La composicion avanzada de
informacion de varios servicios en una respuesta unica corresponde a una posible
evolucion del sistema.

### Codigo Para Mostrar

- [OrdersRoutesConfig.java - enrutamiento y propagacion controlada de contexto](../api-gateway/src/main/java/com/smartlogix/api_gateway/config/OrdersRoutesConfig.java#L35)
- [InventoryRoutesConfig.java - rutas externas de inventario](../api-gateway/src/main/java/com/smartlogix/api_gateway/config/InventoryRoutesConfig.java#L24)
- [ShippingRoutesConfig.java - rutas externas de envios](../api-gateway/src/main/java/com/smartlogix/api_gateway/config/ShippingRoutesConfig.java#L24)
- [application.properties - URLs y rutas del Gateway](../api-gateway/src/main/resources/application.properties#L8)

### Patrones Arquitectonicos Aplicados

| Patron | Aplicacion en SmartLogix | Aporte |
| --- | --- | --- |
| Microservices Architecture | Servicios de auth, inventario, pedidos y envios | Separacion por dominio |
| API Gateway / BFF ligero | Entrada unica de React | Seguridad y rutas externas centralizadas |
| Database per Service | Esquemas independientes por servicio | Bajo acoplamiento de persistencia |
| Layered Architecture | Controller, service, repository, DTO y exception | Codigo organizado y mantenible |

## 8. Patrones De Diseno Implementados

Los patrones principales seleccionados se asocian directamente a problemas de
mantenibilidad y resiliencia presentes en la plataforma.

| Patron | Problema que resuelve | Evidencia directa | Responsable de exposicion |
| --- | --- | --- | --- |
| Repository Pattern | Aislar persistencia de la logica de negocio | [ProductRepository.java](../inventario/src/main/java/com/api/inventario/repository/ProductRepository.java#L17) | Felipe |
| DTO Pattern | Evitar exponer entidades y definir contratos API | [OrderCreateRequest.java](../pedidos/src/main/java/com/api/pedidos/dto/OrderCreateRequest.java#L1) y [ShipmentResponse.java](../envios/src/main/java/com/api/envios/dto/ShipmentResponse.java#L1) | Juan Pablo |
| Circuit Breaker | Controlar fallas en integraciones entre servicios | [InventoryClientConfig.java](../pedidos/src/main/java/com/api/pedidos/config/InventoryClientConfig.java#L37) y [OrdersClientConfig.java](../envios/src/main/java/com/api/envios/config/OrdersClientConfig.java#L34) | Matias / Nicolas |
| Fabrica centralizada de SKU | Concentrar la regla de creacion de codigos | [SkuFactory.java](../inventario/src/main/java/com/api/inventario/factory/SkuFactory.java#L17) | Felipe |
| Separacion frontend por responsabilidades | Desacoplar interfaz, estado y solicitudes HTTP | [apiClient.js](../smartlogix-frontend/Front-Smartlogix/src/services/apiClient.js#L11) y [useAuthSession.js](../smartlogix-frontend/Front-Smartlogix/src/features/auth/hooks/useAuthSession.js#L17) | Juan Pablo |

### Sintesis

Los tres patrones respaldados de forma principal en la defensa son Repository
Pattern, DTO Pattern y Circuit Breaker. Adicionalmente, el sistema incorpora una
fabrica centralizada para SKU y separacion modular de responsabilidades en
React.

## 9. Calidad De Codigo, Pruebas Y Versionamiento

### Buenas Practicas Aplicadas

| Practica | Evidencia |
| --- | --- |
| Controladores orientados a solicitudes HTTP | [ProductController.java](../inventario/src/main/java/com/api/inventario/controller/ProductController.java#L23) |
| Logica de negocio en servicios | [OrderService.java](../pedidos/src/main/java/com/api/pedidos/service/OrderService.java#L34) |
| Persistencia aislada | [ProductRepository.java](../inventario/src/main/java/com/api/inventario/repository/ProductRepository.java#L17) |
| Errores gestionados centralmente | [GlobalExceptionHandler.java](../pedidos/src/main/java/com/api/pedidos/exception/GlobalExceptionHandler.java#L22) |
| Migraciones de base de datos | [V1__create_orders_schema.sql](../pedidos/src/main/resources/db/migration/V1__create_orders_schema.sql#L1) |

### Pruebas Para Mostrar

La evidencia automatizada implementada se concentra en backend, especialmente
en inventario, pedidos y envios.

- [ProductServiceTest.java - reglas de productos y SKU](../inventario/src/test/java/com/api/inventario/service/ProductServiceTest.java#L41)
- [InventoryServiceTest.java - reglas de stock](../inventario/src/test/java/com/api/inventario/service/InventoryServiceTest.java#L41)
- [ApiKeyAuthFilterTest.java - seguridad interna de inventario](../inventario/src/test/java/com/api/inventario/security/ApiKeyAuthFilterTest.java#L36)
- [OrderServiceTest.java - negocio de pedidos](../pedidos/src/test/java/com/api/pedidos/service/OrderServiceTest.java#L60)
- [ShipmentServiceTest.java - reglas de envios](../envios/src/test/java/com/api/envios/service/ShipmentServiceTest.java#L50)

### Estrategia De Versionamiento

El trabajo se organizo mediante ramas por integrante e integraciones a `main`
por Pull Request y merges controlados. Entre las integraciones observables se
encuentran:

| Integracion | Evidencia asociada |
| --- | --- |
| Pull Request `#11` desde `NicolasOlivares` | Incorporacion del modulo de envios |
| Pull Request `#12` desde `MatiasVega` | Incorporacion de trabajo del modulo de pedidos |
| Pull Request `#14` desde `FelipeNorambuena` | Integracion posterior de funcionalidades |

Comandos de evidencia:

```powershell
git branch --all
git log --graph --decorate --oneline --all -n 35
```

## 10. Reflexion Y Evolucion De La Solucion

| Integrante | Reflexion tecnica |
| --- | --- |
| Juan Pablo Gonzalez | Centralizar autenticacion evita replicar manejo de credenciales y roles en cada servicio. |
| Felipe Norambuena | El dominio de inventario conserva reglas de producto y stock en componentes testeables y desacoplados. |
| Matias Vega | Pedidos coordina disponibilidad mediante contratos REST y resiliencia sin acceder a persistencia ajena. |
| Nicolas Olivares | Envios conserva trazabilidad y valida el despacho mediante integraciones controladas. |

### Evoluciones Identificadas

La solucion presentada implementa el flujo funcional principal y su arquitectura
base. Como lineas de evolucion se consideran:

1. Incorporar pruebas automatizadas en frontend.
2. Ampliar pruebas especificas de autenticacion y rutas del API Gateway.
3. Formalizar evidencia documental de resolucion de conflictos durante merges.
4. Evolucionar el BFF ligero hacia endpoints agregadores si futuras vistas del
   frontend requieren datos de varios dominios en una sola respuesta.
5. Extender la fabrica de SKU a estrategias intercambiables si surgen distintas
   reglas de codificacion.

## Accesos Directos A La Evidencia Tecnica

### Autenticacion Y Gateway

- [JwtService.java - linea 36: generacion del JWT](../auth-service/src/main/java/com/smartlogix/auth/service/JwtService.java#L36)
- [SecurityConfig.java - linea 30: cadena de seguridad](../api-gateway/src/main/java/com/smartlogix/api_gateway/config/SecurityConfig.java#L30)
- [OrdersRoutesConfig.java - linea 35: ruta de pedidos](../api-gateway/src/main/java/com/smartlogix/api_gateway/config/OrdersRoutesConfig.java#L35)

### Inventario

- [ProductController.java - linea 67: endpoint de creacion](../inventario/src/main/java/com/api/inventario/controller/ProductController.java#L67)
- [ProductService.java - linea 87: regla de creacion](../inventario/src/main/java/com/api/inventario/service/ProductService.java#L87)
- [SkuFactory.java - linea 17: generacion de SKU](../inventario/src/main/java/com/api/inventario/factory/SkuFactory.java#L17)
- [ProductRepository.java - linea 17: repository de productos](../inventario/src/main/java/com/api/inventario/repository/ProductRepository.java#L17)

### Pedidos

- [OrderService.java - linea 108: creacion del pedido](../pedidos/src/main/java/com/api/pedidos/service/OrderService.java#L108)
- [InventoryClient.java - linea 44: consumo de inventario](../pedidos/src/main/java/com/api/pedidos/client/InventoryClient.java#L44)
- [InventoryClient.java - linea 99: ejecucion resiliente](../pedidos/src/main/java/com/api/pedidos/client/InventoryClient.java#L99)
- [InventoryClientConfig.java - linea 37: Circuit Breaker](../pedidos/src/main/java/com/api/pedidos/config/InventoryClientConfig.java#L37)

### Envios

- [ShipmentService.java - linea 131: creacion del envio](../envios/src/main/java/com/api/envios/service/ShipmentService.java#L131)
- [ShipmentService.java - linea 234: eventos de tracking](../envios/src/main/java/com/api/envios/service/ShipmentService.java#L234)
- [OrdersClient.java - linea 47: consulta del pedido](../envios/src/main/java/com/api/envios/client/OrdersClient.java#L47)
- [OrdersClientConfig.java - linea 34: Circuit Breaker](../envios/src/main/java/com/api/envios/config/OrdersClientConfig.java#L34)

### Frontend

- [apiClient.js - linea 11: cliente HTTP centralizado](../smartlogix-frontend/Front-Smartlogix/src/services/apiClient.js#L11)
- [useAuthSession.js - linea 17: estado de autenticacion](../smartlogix-frontend/Front-Smartlogix/src/features/auth/hooks/useAuthSession.js#L17)
- [useOrdersAdmin.js - linea 57: orquestacion de pedidos](../smartlogix-frontend/Front-Smartlogix/src/features/orders/hooks/useOrdersAdmin.js#L57)

### Pruebas

- [ProductServiceTest.java - linea 41](../inventario/src/test/java/com/api/inventario/service/ProductServiceTest.java#L41)
- [InventoryServiceTest.java - linea 41](../inventario/src/test/java/com/api/inventario/service/InventoryServiceTest.java#L41)
- [OrderServiceTest.java - linea 60](../pedidos/src/test/java/com/api/pedidos/service/OrderServiceTest.java#L60)
- [ShipmentServiceTest.java - linea 50](../envios/src/test/java/com/api/envios/service/ShipmentServiceTest.java#L50)
