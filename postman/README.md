# Postman Collections - Smartlogix

##  Introducción

Este directorio contiene las colecciones de Postman para **Smartlogix**, un sistema de gestión logística de microservicios. Postman es una herramienta que permite probar y documentar APIs de forma fácil e interactiva.

### Descripción del Proyecto
Smartlogix es una plataforma modular de microservicios que gestiona:
- Autenticación y gestión de usuarios administradores
- Pedidos y órdenes
- Inventario de productos
- Gestión de envíos
- Gateway de comunicación entre servicios

---

##  Requisitos Previos

- **Postman** (versión 10.0 o superior)
  - Descargar desde: https://www.postman.com/downloads/
- Acceso a los servidores/URLs de los microservicios
- Credenciales válidas para autenticación
- Node.js y npm (si ejecutas los servicios localmente)

---

##  Importación de Colecciones

Para importar las colecciones en Postman:

1. Abre Postman
2. Haz clic en **Import** (arriba a la izquierda)
3. Selecciona **Upload Files**
4. Importa cada archivo `.json`:

### Colecciones disponibles:

| Colección | Descripción |
|-----------|-------------|
| `smartlogix-auth.postman_collection.json` | Endpoints de autenticación y login |
| `smartlogix-admin-users.postman_collection.json` | Gestión de usuarios administradores |
| `smartlogix-pedidos.postman_collection.json` | Creación y gestión de pedidos |
| `smartlogix-inventario.postman_collection.json` | Consultas y actualizaciones de inventario |
| `smartlogix-envios.postman_collection.json` | Seguimiento y gestión de envíos |
| `smartlogix-gateway.postman_collection.json` | API Gateway para orquestación |

---

##  Configuración del Entorno

### Crear un Environment en Postman:

1. Haz clic en **Environments** (panel izquierdo)
2. Haz clic en **Create New**
3. Asigna un nombre: ej. `Smartlogix-Dev`
4. Añade las siguientes variables:

```json
{
  "base_url": "http://localhost:8000",
  "auth_url": "http://localhost:3001",
  "admin_url": "http://localhost:3002",
  "orders_url": "http://localhost:3003",
  "inventory_url": "http://localhost:3004",
  "shipping_url": "http://localhost:3005",
  "gateway_url": "http://localhost:8080",
  "token": "",
  "refresh_token": ""
}
```

5. Guarda el environment

### Usar variables en requests:
```
{{base_url}}/api/usuarios
{{token}} (en headers de Authorization)
```

---

## 🔐 Descripción de Colecciones

### 1. **Authentication (Auth Service)**
- **URL base**: `{{auth_url}}`
- **Endpoints principales**:
  - `POST /login` - Autenticación de usuario
  - `POST /register` - Registro de nuevos usuarios
  - `POST /refresh-token` - Renovar token
  - `GET /verify` - Verificar token válido

### 2. **Admin Users (Admin Service)**
- **URL base**: `{{admin_url}}`
- **Endpoints principales**:
  - `GET /usuarios` - Listar usuarios
  - `POST /usuarios` - Crear usuario
  - `PUT /usuarios/{id}` - Actualizar usuario
  - `DELETE /usuarios/{id}` - Eliminar usuario

### 3. **Pedidos (Orders Service)**
- **URL base**: `{{orders_url}}`
- **Endpoints principales**:
  - `GET /pedidos` - Listar pedidos
  - `POST /pedidos` - Crear pedido
  - `GET /pedidos/{id}` - Obtener detalles
  - `PUT /pedidos/{id}` - Actualizar estado
  - `DELETE /pedidos/{id}` - Cancelar pedido

### 4. **Inventario (Inventory Service)**
- **URL base**: `{{inventory_url}}`
- **Endpoints principales**:
  - `GET /productos` - Listar productos
  - `GET /productos/{id}` - Detalles del producto
  - `PUT /productos/{id}/stock` - Actualizar stock
  - `GET /productos/stock/bajo` - Productos con bajo stock

### 5. **Envíos (Shipping Service)**
- **URL base**: `{{shipping_url}}`
- **Endpoints principales**:
  - `GET /envios` - Listar envíos
  - `POST /envios` - Crear envío
  - `GET /envios/{id}/tracking` - Seguimiento
  - `PUT /envios/{id}/estado` - Actualizar estado

### 6. **Gateway**
- **URL base**: `{{gateway_url}}`
- Punto de entrada único para todas las solicitudes
- Maneja autenticación y enrutamiento

---

##  Flujo de Trabajo Típico

### 1. **Autenticación**
```
POST {{auth_url}}/login
Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGc...",
  "refresh_token": "xyz...",
  "expires_in": 3600
}
```

2. Copia el `token` y establécelo en tu Environment como `{{token}}`

### 2. **Consultar Productos**
```
GET {{inventory_url}}/productos
Headers:
  Authorization: Bearer {{token}}
```

### 3. **Crear Pedido**
```
POST {{orders_url}}/pedidos
Headers:
  Authorization: Bearer {{token}}
Body:
{
  "cliente_id": "123",
  "productos": [
    {"producto_id": "456", "cantidad": 2}
  ]
}
```

### 4. **Seguimiento de Envío**
```
GET {{shipping_url}}/envios/789/tracking
Headers:
  Authorization: Bearer {{token}}
```

---

##  Autenticación

### Configuración de Headers:

En **Postman**, ve a la sección de un request → **Headers**:

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{token}}` |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |

### Renovar Token:
```
POST {{auth_url}}/refresh-token
Body:
{
  "refresh_token": "{{refresh_token}}"
}
```

El token generalmente expira en **1 hora**. Usa el `refresh_token` para obtener uno nuevo sin necesidad de re-autenticarse.

---

##  Troubleshooting

### Error: "401 Unauthorized"
- **Causa**: Token inválido o expirado
- **Solución**: Obtén un nuevo token con `/login` o `/refresh-token`

### Error: "403 Forbidden"
- **Causa**: Usuario sin permisos
- **Solución**: Verifica los roles y permisos del usuario

### Error: "404 Not Found"
- **Causa**: Endpoint o recurso no existe
- **Solución**: Revisa la URL y el ID del recurso

### Error: "500 Internal Server Error"
- **Causa**: Error en el servidor
- **Solución**: Verifica que todos los microservicios estén ejecutándose

### Los servicios no responden
- Verifica que los servicios estén levantados: `npm start`
- Comprueba que estés usando las URLs correctas en el Environment
- Revisa los logs de los servicios

---

##  Referencias

- [Documentación Oficial de Postman](https://learning.postman.com/)
- [Variables en Postman](https://learning.postman.com/docs/sending-requests/variables/)
- [Autenticación Bearer Token](https://swagger.io/docs/specification/authentication/bearer-token/)
- [Swagger/OpenAPI Documentation](./swagger/) *(si disponible)*

---


