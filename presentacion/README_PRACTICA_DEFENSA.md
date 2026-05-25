# Practica De Defensa Oral SmartLogix

Material interno de estudio y ensayo para la presentacion del proyecto. Este
documento desarrolla la justificacion tecnica, las respuestas individuales, la
evidencia verificable y las brechas que deben comunicarse con precision.

## Objetivo De La Preparacion

La defensa debe demostrar que el equipo:

1. Entiende el problema logistico que resuelve SmartLogix.
2. Puede ejecutar el flujo principal desde React en `localhost`.
3. Puede asociar cada comportamiento visible con codigo concreto.
4. Puede justificar patrones de diseno y arquitectura sin exagerar su alcance.
5. Reconoce brechas reales y propone mejoras coherentes.

La calificacion es individual. Cada integrante debe poder explicar el panorama
general y, con mayor detalle, el modulo bajo su responsabilidad.

## Integrantes Y Dominio De Preparacion

| Integrante | Dominio asignado | Codigo que debe dominar | Pregunta critica |
| --- | --- | --- | --- |
| Felipe Norambuena | Inventario y arquitectura | Productos, stock, `SkuFactory`, repositorios | Por que la regla SKU queda en backend |
| Matias Vega | Pedidos | Creacion, estados, integracion con inventario | Como se protege la reserva de stock |
| Nicolas Olivares | Envios | Shipment, tracking, eventos, OrdersClient | Como se valida un despacho |
| Juan Pablo Gonzalez | Auth y seguridad | JWT, usuarios, roles, Gateway | Donde se valida identidad y autorizacion |

## Relato General Que Todos Deben Manejar

SmartLogix separa cuatro dominios:

| Dominio | Responsabilidad | Lo que no debe hacer |
| --- | --- | --- |
| Auth service | Usuarios, roles, login y JWT | Gestionar productos, pedidos o envios |
| Inventario | Productos, stock y disponibilidad | Autenticar usuarios o crear pedidos |
| Pedidos | Ordenes, items y estados | Acceder directamente a tablas de inventario |
| Envios | Despacho, tracking y eventos | Copiar pedidos completos o manejar login |

El flujo tecnico general es:

```text
Usuario -> React -> API Gateway -> Microservicio correspondiente -> BD propia
                           |
                           +-- valida JWT y roles

Pedidos -> REST + DTO + Circuit Breaker -> Inventario
Envios  -> REST + DTO + Circuit Breaker -> Pedidos
```

## Presentacion En Diez Laminas

| Lamina | Proposito evaluativo | Responsable principal | Evidencia a preparar |
| --- | --- | --- | --- |
| 1. Problema y solucion | Contextualizar el proyecto | Felipe | Diagrama de modulos |
| 2. Demo en localhost | Demostrar producto funcional | Felipe | Servicios levantados |
| 3. Login y roles | Evidenciar seguridad | Juan Pablo | Login y codigo JWT/Gateway |
| 4. Inventario | Evidenciar primer dominio | Felipe | Producto, stock y fabrica SKU |
| 5. Pedidos | Evidenciar integracion | Matias | Pedido con stock reservado |
| 6. Envios | Evidenciar trazabilidad | Nicolas | Envio y eventos |
| 7. Arquitectura | Justificar microservicios/BFF | Felipe / Juan Pablo | Diagrama y properties |
| 8. Patrones | Responder puntos 1 y 5 | Todos | Tabla patron/problema/codigo |
| 9. Pruebas y Git | Responder puntos 3, 4 y 7 | Matias / Nicolas | Tests e historial |
| 10. Reflexion | Demostrar criterio tecnico | Todos | Brechas y mejoras |

## Cumplimiento De Los Siete Puntos

| Punto solicitado | Estado defendible | Evidencia del repositorio | Que debe decirse |
| --- | --- | --- | --- |
| 1. Tres o mas patrones frontend/backend | Cumplimiento con matiz | Repository, DTO, Circuit Breaker, fabrica de SKU y separacion frontend | Defender como patrones principales Repository, DTO y Circuit Breaker; fabrica como complemento |
| 2. BFF y microservicios | Cumplimiento parcial fuerte | React, Gateway, cuatro microservicios y BD por servicio | Definir el Gateway como BFF ligero |
| 3. Branching organizado | Parcial | Ramas por integrante y merges/PR visibles | Explicar integracion mediante ramas y reconocer falta de registro formal de conflictos |
| 4. Buenas practicas y pruebas | Parcial | Capas, DTO, validaciones y pruebas backend | No afirmar pruebas frontend ni cobertura exhaustiva total |
| 5. Explicar patrones | Cumplible en exposicion | Codigo asociado a problemas concretos | Vincular patron, problema y beneficio |
| 6. Explicar arquitectura | Cumplible en exposicion | Gateway, DTOs, DB propia, clientes REST | Relacionar desacoplamiento, escalabilidad y resiliencia |
| 7. Detallar branching/conflictos | Parcial | Historial Git con merges | Presentar merges reales; conflicto documentado queda pendiente |

## Evidencia Tecnica Por Punto

### Punto 1: Patrones De Diseno

| Patron | Problema resuelto | Implementacion visible | Expositor |
| --- | --- | --- | --- |
| Repository Pattern | No mezclar consultas con negocio | `inventario/.../repository/ProductRepository.java` y repositorios equivalentes | Felipe |
| DTO Pattern | No exponer entidades y controlar contratos | Carpetas `dto/` de los servicios | Juan Pablo |
| Circuit Breaker | Evitar fallas encadenadas | `pedidos/.../InventoryClientConfig.java`, `envios/.../OrdersClientConfig.java` | Matias / Nicolas |
| Fabrica centralizada | Evitar duplicar regla de SKU | `inventario/.../factory/SkuFactory.java` | Felipe |
| Frontend por componentes/hooks/servicios | Separar UI, estado y HTTP | `src/features/**`, `src/services/apiClient.js` | Juan Pablo |

Argumento recomendado:

"No seleccionamos patrones solo por nombre. Repository aisla persistencia, DTO
protege el contrato de API y Circuit Breaker responde al riesgo real de que una
integracion entre microservicios falle. En frontend, hooks y servicios evitan
que el componente visual contenga toda la logica de comunicacion."

### Punto 2: BFF Y Microservicios

| Evidencia | Archivo o componente | Interpretacion |
| --- | --- | --- |
| Entrada unica React | `smartlogix-frontend/Front-Smartlogix/src/services/apiClient.js` | Todas las llamadas apuntan al Gateway |
| Seguridad y roles | `api-gateway/.../config/SecurityConfig.java` | JWT y control inicial centralizados |
| Enrutamiento | `api-gateway/.../config/*RoutesConfig.java` | Rutas externas hacia APIs internas |
| Bases independientes | `application.properties` de cada servicio | Database per Service |
| Comunicacion REST | `InventoryClient`, `OrdersClient` | Servicios no consultan tablas ajenas |

Respuesta recomendada sobre BFF:

"El Gateway tiene comportamiento de BFF ligero porque es la interfaz backend
orientada al cliente React: expone sus rutas, inserta contexto interno y maneja
seguridad. No implementa aun endpoints agregadores de varias fuentes; eso seria
la siguiente evolucion si el frontend la necesitara."

### Punto 3: Branching

El historial disponible muestra ramas:

- `FelipeNorambuena`
- `MatiasVega`
- `NicolasOlivares`
- `main`

Merges utiles para exponer:

| Merge visible | Aporte asociado |
| --- | --- |
| `Merge pull request #11 from FelipeNorambuena/NicolasOlivares` | Modulo de envios |
| `Merge pull request #12 from FelipeNorambuena/MatiasVega` | Trabajo integrado de Matias |
| `Merge pull request #14 from FelipeNorambuena/FelipeNorambuena` | Integracion de funcionalidades posteriores |

Interpretacion correcta:

"La estrategia efectivamente observable usa ramas por integrante y Pull
Requests frecuentes hacia `main`. Aunque la documentacion menciona Trunk-Based,
no la presentaremos como una aplicacion pura, porque las ramas personales se
mantuvieron durante varias integraciones."

Brecha:

No se encontro una bitacora que identifique un conflicto concreto, los archivos
afectados y la decision de resolucion. Si no se incorpora evidencia real antes
de la defensa, debe declararse como mejora documental.

### Punto 4: Buenas Practicas Y Pruebas

Buenas practicas implementadas:

| Practica | Evidencia |
| --- | --- |
| Controladores delgados | `ProductController`, `OrderController`, `ShipmentController` |
| Reglas en servicios | `ProductService`, `OrderService`, `ShipmentService` |
| Repositories aislados | Paquetes `repository/` |
| DTOs de entrada y salida | Paquetes `dto/` |
| Validacion de entrada | Uso de `@Valid` en controllers |
| Errores centralizados | `GlobalExceptionHandler` por servicio |
| Migraciones | `src/main/resources/db/migration/` |
| Resiliencia | Configuraciones Resilience4j |

Pruebas encontradas:

| Modulo | Alcance visible |
| --- | --- |
| Inventario | Servicios, controllers, seguridad y repositorio de integracion |
| Pedidos | Servicio y carga de contexto |
| Envios | Servicio y carga de contexto |
| Auth service | Carga de contexto |
| API Gateway | Carga de contexto |
| Frontend | No se encontraron tests automatizados |

Respuesta honesta:

"La evidencia de pruebas mas fuerte esta en backend, sobre todo inventario,
pedidos y envios. No afirmamos cobertura exhaustiva de toda la solucion porque
frontend todavia no tiene suite automatizada y auth/gateway tienen cobertura
inicial."

### Puntos 5 Y 6: Explicacion Y Justificacion

Para cualquier patron o decision arquitectonica, responder siempre con esta
estructura:

1. Problema observado.
2. Decision tomada.
3. Codigo donde se aplica.
4. Beneficio obtenido.
5. Limite o mejora futura, si existe.

Ejemplo con Circuit Breaker:

"Pedidos depende de inventario para reservar stock. Si inventario no esta
disponible, una falla sin manejo impediria crear pedidos y produciria errores no
controlados. Por eso `InventoryClient` ejecuta llamadas bajo un Circuit Breaker
configurado en `InventoryClientConfig`. El beneficio es cortar llamadas fallidas
y entregar una respuesta controlada; como mejora se podrian exponer metricas
operacionales."

### Punto 7: Colaboracion Y Control De Versiones

Mostrar en terminal:

```powershell
git branch --all
git log --graph --decorate --oneline --all -n 35
```

Respuesta recomendada:

"El historial permite distinguir los aportes por rama y su integracion en
`main`. La colaboracion se favorecio porque cada integrante pudo trabajar en su
dominio y luego integrar por Pull Request. Para una proxima iteracion
registrariamos formalmente los conflictos, decisiones y pruebas realizadas
despues de cada merge."

## Patrones: Explicacion Para Preguntas Tecnicas

### Repository Pattern

**Que es:** una capa que encapsula la persistencia y consultas.

**Donde esta:** `ProductRepository`, `InventoryRepository`,
`OrderRepository`, `ShipmentRepository`, `UserRepository`.

**Problema que resuelve:** evita que controllers o services construyan acceso
a base de datos directamente.

**Beneficio:** facilita cambio de consultas y pruebas unitarias con mocks.

**Respuesta corta:**

"El servicio expresa reglas del negocio y el repository expresa persistencia.
Asi podemos probar reglas sin depender siempre de MySQL."

### DTO Pattern

**Que es:** objetos especificos de solicitud y respuesta.

**Donde esta:** paquetes `dto/` en cada microservicio.

**Problema que resuelve:** una entidad JPA no debe convertirse automaticamente
en contrato externo.

**Beneficio:** validacion, seguridad y evolucion independiente de API/modelo.

**Respuesta corta:**

"La API expone contratos, no tablas. Por eso usamos DTOs y evitamos devolver
entidades directamente."

### Circuit Breaker

**Que es:** patron de resiliencia que deja de ejecutar temporalmente llamadas
que estan fallando repetidamente.

**Donde esta:** configuraciones de clientes REST en pedidos y envios.

**Problema que resuelve:** fallas en cascada al depender de otro servicio.

**Beneficio:** error controlado y recuperacion gradual.

**Respuesta corta:**

"Si inventario o pedidos no esta disponible, el servicio consumidor falla de
forma controlada en lugar de insistir indefinidamente y degradar el sistema."

### Fabrica De SKU

**Que es:** componente que concentra la creacion del siguiente codigo SKU.

**Donde esta:** `inventario/src/main/java/com/api/inventario/factory/SkuFactory.java`.

**Problema que resuelve:** evita generar codigos en distintos puntos del sistema.

**Beneficio:** si cambia el formato, existe un unico lugar principal para
ajustarlo.

**Matiz obligatorio:**

"La implementacion actual es una fabrica centralizada. Si el requerimiento
exigiera Factory Method GoF estricto, agregariamos creadores o estrategias
intercambiables segun tipo de SKU."

### Frontend Modular

**Que es:** organizacion de React por componentes, hooks y servicios.

**Donde esta:** `src/features/` y `src/services/apiClient.js`.

**Problema que resuelve:** componentes demasiado grandes con UI, estado y
llamadas HTTP mezclados.

**Beneficio:** reutilizacion, lectura clara y cambios localizados.

**Respuesta corta:**

"La pantalla renderiza; el hook coordina estado y acciones; el servicio conoce
el contrato HTTP con el Gateway."

## Guion Individual Extendido

### Felipe Norambuena

**Inicio sugerido:**

"Mi aporte principal se concentra en inventario y en la lectura arquitectonica
de la solucion. Inventario mantiene productos y stock en un dominio propio,
expone DTOs y usa repositories para persistencia. La generacion de SKU queda en
backend mediante `SkuFactory`, porque no debe depender de una pantalla React."

**Debe poder mostrar:**

- `ProductController` delegando a `ProductService`.
- `ProductService.create()` seleccionando SKU generado o recibido.
- `SkuFactory.nextSku()`.
- `ProductRepository`.

**Reflexion individual:**

"La decision mas relevante fue mantener las reglas en el servicio y no en el
controller o frontend. Eso permite validar y probar la logica de inventario sin
depender de la interfaz."

### Matias Vega

**Inicio sugerido:**

"Mi modulo es pedidos. La orden necesita validar y reservar inventario, pero no
puede acoplarse a su base de datos. Por eso consume inventory-service con un
cliente REST y DTOs. Ademas protegemos la llamada con Circuit Breaker."

**Debe poder mostrar:**

- `OrderService.createOrder()`.
- Reserva de stock y liberacion compensatoria si ocurre un error.
- `InventoryClient`.
- `InventoryClientConfig`.

**Reflexion individual:**

"Pedidos actua como coordinador del flujo comercial. Mantener la integracion por
API preserva la independencia de los servicios y permite manejar fallas de
inventario de forma explicita."

### Nicolas Olivares

**Inicio sugerido:**

"Mi modulo es envios. La responsabilidad es crear despachos y registrar su
seguimiento. Antes de crear un envio, consultamos pedidos y verificamos que este
listo para despacho. Cada cambio relevante genera un evento de trazabilidad."

**Debe poder mostrar:**

- `ShipmentService.create()`.
- Validacion de pedido apto.
- Registro de `ShipmentEvent`.
- `OrdersClient` y `OrdersClientConfig`.

**Reflexion individual:**

"El seguimiento requiere preservar historial, no solo guardar el ultimo estado.
Por eso se registran eventos y se mantiene el envio desacoplado del pedido
completo."

### Juan Pablo Gonzalez

**Inicio sugerido:**

"Mi area principal es autenticacion. El auth-service centraliza usuarios,
credenciales y roles y genera JWT. El Gateway valida el token y filtra rutas por
rol, evitando duplicar autenticacion en cada microservicio."

**Debe poder mostrar:**

- `JwtService.createToken()`.
- Claims incluidos en JWT.
- `SecurityConfig` del Gateway.
- Frontend enviando `Authorization: Bearer TOKEN` desde `apiClient.js`.

**Reflexion individual:**

"Centralizar autenticacion mejora seguridad y mantiene los servicios de negocio
enfocados en sus responsabilidades. Un servicio de inventario no debe saber
como validar contrasenas."

## Banco De Preguntas Por Integrante

### Preguntas Para Felipe

| Pregunta | Respuesta de practica |
| --- | --- |
| Que administra inventario? | Productos, stock y disponibilidad; no usuarios, login, pedidos ni envios. |
| Por que el SKU se genera en backend? | Porque es regla de negocio y debe ser consistente sin importar que cliente consuma la API. |
| Como evita SKU duplicados? | El servicio consulta el repository antes de guardar y la fabrica propone el siguiente SKU automatico. |
| Que patron demuestra `ProductRepository`? | Repository Pattern, que abstrae persistencia de las reglas en `ProductService`. |
| Es `SkuFactory` un Factory Method formal? | Hoy es una fabrica centralizada; se puede extender a creadores/estrategias si aparecen formatos variables. |
| Como aporta Database per Service? | Inventario evoluciona sus tablas sin que pedidos o envios accedan directamente a ellas. |

### Preguntas Para Matias

| Pregunta | Respuesta de practica |
| --- | --- |
| Como consulta stock pedidos? | Por REST mediante `InventoryClient` usando DTOs de producto y disponibilidad. |
| Por que no consultar directamente la BD de inventario? | Romperia independencia de dominios y acoplaria tablas entre servicios. |
| Que ocurre durante la creacion de un pedido? | Se resuelven productos, se valida disponibilidad, se reserva stock y luego se persiste la orden confirmada. |
| Que pasa si falla luego de reservar parte del stock? | El servicio intenta liberar las reservas ya realizadas como compensacion. |
| Donde se aplica Circuit Breaker? | En el cliente hacia inventario y tambien existe integracion protegida hacia auth-service. |
| Que estados controla el pedido? | Estados como `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED` y `CANCELLED`, con transiciones permitidas. |

### Preguntas Para Nicolas

| Pregunta | Respuesta de practica |
| --- | --- |
| Que administra envios? | Despachos, transportista, tracking, estados y eventos de seguimiento. |
| Como valida que puede crear un envio? | Consulta el pedido por `OrdersClient` y exige estado `CONFIRMED` o `SHIPPED`. |
| Como evita dos envios para un pedido? | Verifica mediante su repository que el `orderId` no tenga ya un envio asociado. |
| Para que sirven los eventos? | Para conservar trazabilidad historica de cada cambio de estado. |
| Como responde si pedidos esta caido? | El cliente esta protegido por Circuit Breaker y entrega un error de servicio no disponible. |
| Por que no almacena todo el pedido? | Porque el dominio de pedidos es propietario de esa informacion y duplicarla genera inconsistencias. |

### Preguntas Para Juan Pablo

| Pregunta | Respuesta de practica |
| --- | --- |
| Quien genera JWT? | Solamente `auth-service` despues de validar credenciales. |
| Que claims contiene? | `userId`, `email`, `roles`, fecha de emision y fecha de expiracion. |
| Quien valida el JWT? | El API Gateway en la capa inicial de acceso. |
| Como se aplica autorizacion? | `SecurityConfig` configura rutas permitidas segun roles extraidos del JWT. |
| Por que auth no se replica en otros servicios? | Para no duplicar credenciales, roles o reglas sensibles y mantener una unica responsabilidad. |
| Por que el Gateway es BFF ligero? | Porque sirve especificamente a React mediante rutas y seguridad, aunque no agrega todavia respuestas complejas. |

## Preguntas Transversales

| Pregunta del docente | Respuesta recomendada |
| --- | --- |
| Cuales son los tres patrones principales? | Repository Pattern, DTO Pattern y Circuit Breaker; ademas se muestra fabrica de SKU y modularidad frontend. |
| Como se mejora la mantenibilidad? | Cada responsabilidad esta aislada: UI, reglas de negocio, persistencia, contratos e integraciones cambian en lugares definidos. |
| Por que Spring Boot y Maven? | Entregan estructura reproducible, dependencias controladas, ejecucion de pruebas y componentes empresariales adecuados. |
| Como es escalable la solucion? | Los dominios estan separados y pueden evolucionar o desplegarse independientemente, manteniendo bases propias. |
| Que pasa si inventory-service falla? | Pedidos controla esa dependencia mediante Circuit Breaker y responde con error manejado. |
| Existe seguridad entre servicios? | El Gateway valida JWT y las rutas internas utilizan headers/API key configurados para llamadas controladas. |
| Tienen pruebas frontend? | No automatizadas actualmente; es una brecha identificada. |
| Tienen pruebas exhaustivas? | Tenemos cobertura backend focalizada en reglas criticas, especialmente en inventario, pedidos y envios; no declaramos cobertura exhaustiva total. |
| Que estrategia Git utilizaron? | Ramas por integrante con integracion frecuente por Pull Requests hacia `main`. |
| Como resolvieron conflictos? | El historial evidencia merges de sincronizacion; el registro detallado de un conflicto concreto no esta documentado y se reconoce como mejora. |
| Que cambiaria para produccion? | Secretos externos obligatorios, mas pruebas de seguridad e integracion, pruebas frontend y observabilidad para Circuit Breakers. |

## Codigo Que Deben Practicar Mostrando

| Tema | Ruta | Que explicar en 20 segundos |
| --- | --- | --- |
| Token JWT | `auth-service/src/main/java/com/smartlogix/auth/service/JwtService.java` | Construccion del token y claims |
| Roles Gateway | `api-gateway/src/main/java/com/smartlogix/api_gateway/config/SecurityConfig.java` | Rutas y roles permitidos |
| Rutas pedidos | `api-gateway/src/main/java/com/smartlogix/api_gateway/config/OrdersRoutesConfig.java` | Rewrite y contexto interno |
| Producto | `inventario/src/main/java/com/api/inventario/service/ProductService.java` | Logica separada del controller |
| SKU | `inventario/src/main/java/com/api/inventario/factory/SkuFactory.java` | Creacion centralizada |
| Repository | `inventario/src/main/java/com/api/inventario/repository/ProductRepository.java` | Persistencia encapsulada |
| Pedido | `pedidos/src/main/java/com/api/pedidos/service/OrderService.java` | Reserva, total y estados |
| Resiliencia pedidos | `pedidos/src/main/java/com/api/pedidos/config/InventoryClientConfig.java` | Circuit Breaker configurado |
| Envio | `envios/src/main/java/com/api/envios/service/ShipmentService.java` | Despacho y eventos |
| Resiliencia envios | `envios/src/main/java/com/api/envios/config/OrdersClientConfig.java` | Fallas controladas |
| Cliente frontend | `smartlogix-frontend/Front-Smartlogix/src/services/apiClient.js` | Gateway y bearer token |
| Estado frontend | `smartlogix-frontend/Front-Smartlogix/src/features/auth/hooks/useAuthSession.js` | UI desacoplada de login |

## Evidencia De Pruebas Para Mostrar

No basta con afirmar que hay tests: se debe abrir al menos un archivo de prueba
y explicar una regla cubierta.

| Modulo | Archivo | Regla para explicar |
| --- | --- | --- |
| Inventario | `inventario/src/test/java/com/api/inventario/service/ProductServiceTest.java` | SKU duplicado o automatico |
| Inventario | `inventario/src/test/java/com/api/inventario/service/InventoryServiceTest.java` | Operaciones de stock |
| Inventario | `inventario/src/test/java/com/api/inventario/security/ApiKeyAuthFilterTest.java` | API key interna |
| Pedidos | `pedidos/src/test/java/com/api/pedidos/service/OrderServiceTest.java` | Stock, roles o estados |
| Envios | `envios/src/test/java/com/api/envios/service/ShipmentServiceTest.java` | Creacion o transiciones |

Antes de la defensa, ejecutar y registrar el resultado real de las pruebas que
se decidan presentar. Si alguna no se ejecuta satisfactoriamente, no afirmar su
resultado; mostrar solamente que el archivo existe y declarar el estado.

## Evidencia Git Para Practicar

### Comandos

```powershell
git status --short --branch
git branch --all --verbose
git log --graph --decorate --oneline --all -n 35
```

### Relato De 30 Segundos

"Este historial muestra el trabajo por ramas y su integracion a `main`. Por
ejemplo, se observa la incorporacion de envios desde la rama de Nicolas, el
aporte de Matias y posteriores integraciones de Felipe. Usamos commits
descriptivos y Pull Requests para integrar funcionalidades. Una oportunidad de
mejora es documentar en una bitacora los conflictos especificos y las
validaciones posteriores al merge."

## Brechas Que Deben Reconocer

| Brecha actual | Como declararla | Mejora futura coherente |
| --- | --- | --- |
| Sin tests frontend automatizados visibles | "La cobertura automatizada actual se concentra en backend." | Agregar Vitest y Testing Library |
| Auth y Gateway con cobertura basica | "Tienen validacion inicial de contexto; se debe ampliar seguridad." | Tests JWT y autorizacion por rutas |
| BFF sin composicion avanzada | "Gateway opera como BFF ligero." | Endpoint agregado para dashboard |
| Fabrica SKU no es Factory Method GoF completo | "Centralizamos la creacion; puede evolucionar." | Estrategias de SKU intercambiables |
| Conflictos Git sin bitacora explicita | "Hay merges verificables, falta documentar decisiones." | Registro de conflictos y pruebas posmerge |
| README principal deja evidencia funcional pendiente | "La demo en vivo aporta evidencia; falta formalizarla como anexo." | Capturas y resultados documentados |

## Ensayo De La Demostracion En Localhost

### Datos Que Deben Preparar

| Dato | Preparacion necesaria |
| --- | --- |
| Usuario administrador | Credencial valida y conocida por quien ejecuta login |
| Usuario de rol restringido | Opcional, solo si se mostrara bloqueo por rol |
| Producto de demo | SKU conocido y stock suficiente |
| Pedido de respaldo | Pedido confirmado listo si falla creacion en vivo |
| Envio de respaldo | Tracking conocido para consultar eventos |

### Flujo Ensayado

1. Abrir `http://localhost:5173`.
2. Juan Pablo inicia sesion como `ADMIN`.
3. Felipe lista productos y identifica el SKU preparado.
4. Felipe muestra stock suficiente.
5. Matias crea un pedido con ese producto.
6. Matias abre detalle del pedido y verifica estado.
7. Nicolas crea un envio para el pedido habilitado.
8. Nicolas actualiza estado o muestra eventos.
9. Juan Pablo abre codigo JWT/Gateway.
10. Cada integrante abre el archivo tecnico de su modulo.
11. Matias muestra una prueba de negocio.
12. Nicolas muestra historial Git.

### Ensayo De Fallas

Practicar tambien estas situaciones para no bloquearse:

| Situacion | Respuesta oral y tecnica |
| --- | --- |
| Producto sin stock | Explicar que la validacion impide crear un pedido inconsistente |
| Pedido no apto para envio | Explicar regla de estados en `ShipmentService` |
| Error 403 | Explicar autorizacion por roles del Gateway |
| Servicio dependiente apagado | Mostrar Circuit Breaker y usar evidencia de codigo |
| Pantalla no responde | Cambiar a Postman y continuar flujo API |

## Metodo De Practica Individual

Cada integrante debe completar tres rondas.

### Ronda 1: Explicacion Propia

- Duracion maxima: 90 segundos por integrante.
- Mostrar su flujo visible en pantalla.
- Abrir un archivo de servicio y un archivo de patron.
- Cerrar con una reflexion tecnica.

### Ronda 2: Preguntas Cruzadas

- Los demas integrantes formulan tres preguntas aleatorias del banco.
- La respuesta debe mencionar un archivo o comportamiento real.
- Si una respuesta depende de algo no implementado, debe declararlo como mejora.

### Ronda 3: Defensa Completa Cronometrada

| Hito | Tiempo maximo |
| --- | --- |
| Contexto y arquitectura funcional | 2 min |
| Demo de los cuatro modulos | 5 min |
| Codigo y patrones | 4 min |
| Pruebas y Git | 2 min |
| Cierre | 1 min |

## Lista De Verificacion Final

### Presentacion

- [ ] Las diez laminas estan terminadas y tienen poco texto.
- [ ] Cada integrante conoce su momento de intervencion.
- [ ] El diagrama utiliza los puertos reales.
- [ ] La lamina de patrones identifica codigo concreto.
- [ ] La lamina de mejoras no afirma implementaciones pendientes.

### Demostracion

- [ ] Todos los servicios inician correctamente.
- [ ] El login de demostracion funciona.
- [ ] El SKU y stock de prueba estan definidos.
- [ ] Se ha creado un pedido de ensayo.
- [ ] Se ha creado o preparado un envio de ensayo.
- [ ] Postman esta disponible como respaldo.

### Codigo Y Evidencia

- [ ] Los archivos clave estan abiertos en el IDE.
- [ ] Se sabe que lineas se mostraran en cada archivo.
- [ ] Se ejecutaron las pruebas que se afirmaran como exitosas.
- [ ] El comando de historial Git esta preparado.
- [ ] Nadie afirmara tests frontend, Factory Method formal o conflictos documentados si no se implementan antes.

## Decisiones Pendientes Antes De La Presentacion

Estas actividades pueden mejorar la evidencia, pero no forman parte de la
implementacion actual hasta que el equipo decida realizarlas:

| Decision | Beneficio en la defensa | Esfuerzo esperado |
| --- | --- | --- |
| Ejecutar y guardar resultados de tests backend | Evidencia real para punto 4 | Bajo |
| Capturar flujo funcional en localhost | Evidencia de respaldo si falla demo | Bajo |
| Documentar un conflicto real del historial | Refuerza puntos 3 y 7 | Bajo/medio |
| Agregar tests frontend | Refuerza punto 4 | Medio |
| Formalizar Factory Method de SKU | Reduce observacion del punto 1 | Medio |
| Incorporar agregacion BFF | Refuerza punto 2, pero aumenta riesgo | Alto |

