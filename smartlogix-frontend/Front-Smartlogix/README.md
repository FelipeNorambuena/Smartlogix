# SmartLogix Frontend

Frontend React de SmartLogix. Consume el API Gateway y ofrece interfaces para autenticacion, administracion de usuarios, inventario, pedidos, cliente y envios.

## Stack

- React `19.2.5`
- Vite `8.0.10`
- NPM
- ESLint

## Estructura

```text
Front-Smartlogix/
  package.json
  package-lock.json
  index.html
  vite.config.js
  eslint.config.js
  public/
    smartlogix-logo.svg
    smartlogix-favicon.svg
  src/
    App.jsx
    main.jsx
    index.css
    services/
      apiClient.js
      authService.js
    features/
      auth/
      authAdmin/
      admin/
      inventory/
      inventoryOperator/
      orders/
      ordersOperator/
      customer/
      shipping/
      shippingOperator/
```

## Configuracion

El cliente HTTP central esta en:

```text
src/services/apiClient.js
```

Variable de entorno soportada:

```text
VITE_API_BASE_URL=http://localhost:8080
```

Si no se define, el frontend usa `http://localhost:8080`.

## Instalacion

Desde esta carpeta:

```powershell
npm install
```

## Ejecucion local

```powershell
npm run dev
```

URL por defecto:

```text
http://localhost:5173
```

## Build

```powershell
npm run build
```

## Lint

```powershell
npm run lint
```

## Preview de produccion

```powershell
npm run preview
```

## Dependencias principales

```json
{
  "react": "^19.2.5",
  "react-dom": "^19.2.5"
}
```

Dependencias de desarrollo principales:

```json
{
  "vite": "^8.0.10",
  "@vitejs/plugin-react": "^6.0.1",
  "eslint": "^10.2.1"
}
```

## Pruebas manuales recomendadas

1. Levantar `auth-service` y `api-gateway`.
2. Ejecutar el frontend con `npm run dev`.
3. Iniciar sesion desde la pantalla de login.
4. Validar que el token se envie como `Authorization: Bearer TOKEN`.
5. Probar modulos segun rol: usuarios, inventario, pedidos y envios.

## Observaciones

- No hay script `test` configurado actualmente en `package.json`.
- La validacion automatica disponible para este componente es `npm run lint` y `npm run build`.
