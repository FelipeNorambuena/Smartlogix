import { apiRequest } from '../../../services/apiClient'

/*
 * Servicio frontend del modulo inventario.
 * Todas las rutas son publicas del API Gateway, no del microservicio directo.
 */
export function fetchInventory({ filters, page, size, token }) {
  const query = new URLSearchParams()

  addQueryParam(query, 'sku', filters.sku)
  addQueryParam(query, 'warehouseLocation', filters.warehouseLocation)
  addQueryParam(query, 'lowStock', filters.lowStock)
  query.set('page', String(page))
  query.set('size', String(size))

  return apiRequest(`/inventory?${query.toString()}`, { token })
}

export function fetchInventoryByProductId({ productId, token }) {
  return apiRequest(`/inventory/${productId}`, { token })
}

export function fetchStockByProductId({ productId, token }) {
  return apiRequest(`/inventory/${productId}/stock`, { token })
}

export function checkStockAvailability({ productId, quantity, token }) {
  return apiRequest(`/inventory/${productId}/availability?quantity=${quantity}`, {
    token,
  })
}

export function updateProductInventory({ inventory, productId, token }) {
  return apiRequest(`/inventory/${productId}`, {
    method: 'PUT',
    body: inventory,
    token,
  })
}

export function reserveStock({ productId, quantity, token }) {
  return runStockOperation({ operation: 'reserve', productId, quantity, token })
}

export function releaseStock({ productId, quantity, token }) {
  return runStockOperation({ operation: 'release', productId, quantity, token })
}

export function confirmStock({ productId, quantity, token }) {
  return runStockOperation({ operation: 'confirm', productId, quantity, token })
}

export function fetchProducts({ filters, page, size, token }) {
  const query = new URLSearchParams()

  addQueryParam(query, 'sku', filters.sku)
  addQueryParam(query, 'name', filters.name)
  addQueryParam(query, 'category', filters.category)
  query.set('page', String(page))
  query.set('size', String(size))

  return apiRequest(`/inventory/products?${query.toString()}`, { token })
}

export function fetchNextSku({ token }) {
  return apiRequest('/inventory/products/next-sku', { token })
}

export function fetchProductById({ productId, token }) {
  return apiRequest(`/inventory/products/${productId}`, { token })
}

export function fetchProductBySku({ sku, token }) {
  return apiRequest(`/inventory/products/sku/${encodeURIComponent(sku)}`, {
    token,
  })
}

export function createProduct({ product, token }) {
  return apiRequest('/inventory/products', {
    method: 'POST',
    body: product,
    token,
  })
}

export function updateProduct({ product, productId, token }) {
  return apiRequest(`/inventory/products/${productId}`, {
    method: 'PUT',
    body: product,
    token,
  })
}

export function deleteProduct({ productId, token }) {
  return apiRequest(`/inventory/products/${productId}`, {
    method: 'DELETE',
    token,
  })
}

function runStockOperation({ operation, productId, quantity, token }) {
  return apiRequest(`/inventory/${productId}/${operation}`, {
    method: 'POST',
    body: { quantity: Number(quantity) },
    token,
  })
}

function addQueryParam(query, key, value) {
  if (value === '' || value === null || value === undefined) {
    return
  }

  query.set(key, String(value))
}
