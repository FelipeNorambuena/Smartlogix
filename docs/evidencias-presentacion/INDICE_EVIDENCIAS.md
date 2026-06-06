# Evidencias visuales para presentacion SmartLogix

Carpeta generada para adjuntar capturas y diagramas en la defensa de la EV3 Fullstack.
Las imagenes estan en formato PNG y se pueden insertar directamente en PowerPoint, Canva, Gamma, Google Slides u otra herramienta.

## Capturas disponibles

| Archivo | Uso sugerido en la presentacion |
| --- | --- |
| `01_frontend_login.png` | Diapositiva de frontend React, experiencia de acceso y seguridad de usuario. |
| `02_api_gateway_401_protegido.png` | Diapositiva de seguridad/API Gateway: evidencia de ruta protegida sin autenticacion. |
| `03_swagger_inventory_service.png` | Diapositiva API REST: endpoints de inventario/productos. |
| `04_swagger_auth_service.png` | Diapositiva API REST: endpoints de autenticacion, usuarios y roles. |
| `05_swagger_envios_service.png` | Diapositiva API REST: endpoints de envios y tracking. |
| `06_swagger_pedidos_service.png` | Diapositiva API REST: endpoints de pedidos. |
| `07_jacoco_auth_service.png` | Diapositiva de pruebas backend: cobertura JaCoCo auth-service. |
| `08_jacoco_api_gateway.png` | Diapositiva de pruebas backend: cobertura JaCoCo api-gateway. |
| `09_jacoco_inventario.png` | Diapositiva de pruebas backend: cobertura JaCoCo inventario. |
| `10_jacoco_pedidos.png` | Diapositiva de pruebas backend: cobertura JaCoCo pedidos. |
| `11_jacoco_envios.png` | Diapositiva de pruebas backend: cobertura JaCoCo envios. |
| `12_vitest_frontend_coverage.png` | Diapositiva de pruebas frontend: cobertura Vitest + Testing Library. |

## Diagramas disponibles

| Archivo | Uso sugerido en la presentacion |
| --- | --- |
| `Gemini_Generated_Image_crs9zjcrs9zjcrs9.png` | Diapositiva de arquitectura general: React, API Gateway, microservicios, comunicacion REST, Circuit Breaker y bases de datos por servicio. |
| `Gemini_Generated_Image_6jzhp46jzhp46jzh.png` | Diapositiva tecnica de backend y persistencia: flujo por microservicio, capas controller/service/repository y separacion de bases de datos. |
| `Gemini_Generated_Image_s60dv1s60dv1s60d.png` | Diapositiva de modelo de datos: entidades principales por microservicio y referencias logicas entre auth, inventario, pedidos y envios. |

## Orden recomendado

1. Abrir con `Gemini_Generated_Image_crs9zjcrs9zjcrs9.png` para explicar la arquitectura general.
2. Usar `Gemini_Generated_Image_6jzhp46jzhp46jzh.png` cuando expliques separacion por capas, DTOs, repositories y Database per Service.
3. Mostrar `Gemini_Generated_Image_s60dv1s60dv1s60d.png` en la parte de persistencia y modelo de datos.
4. Mostrar `01_frontend_login.png` cuando expliques la capa React.
5. Mostrar `02_api_gateway_401_protegido.png` cuando expliques JWT/API Gateway.
6. Usar una o dos capturas Swagger para demostrar API REST; no es necesario poner las cuatro si la presentacion queda muy larga.
7. Usar las capturas JaCoCo y Vitest en la seccion de pruebas unitarias y cobertura.

## Nota tecnica

Estas capturas fueron tomadas desde los servicios locales:

- Frontend: `http://127.0.0.1:5173/`
- API Gateway: `http://localhost:8080/`
- Inventario: `http://localhost:8081/swagger-ui.html`
- Auth-service: `http://localhost:8082/swagger-ui.html`
- Envios: `http://localhost:8083/swagger-ui.html`
- Pedidos: `http://localhost:8084/swagger-ui.html`
- Reportes JaCoCo: `target/site/jacoco/index.html`
- Reporte frontend: `smartlogix-frontend/Front-Smartlogix/coverage/index.html`
