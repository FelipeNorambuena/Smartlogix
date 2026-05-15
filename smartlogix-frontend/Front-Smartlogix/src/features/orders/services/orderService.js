import { apiRequest } from '../../../services/apiClient'

/*
 * Servicio frontend del modulo pedidos.
 * Todas las rutas pasan por API Gateway y usan el JWT de la sesion activa.
 */
export function fetchOrders({ filters, page, size, token }) {
  const query = new URLSearchParams()

  addQueryParam(query, 'customerId', filters.customerId)
  addQueryParam(query, 'status', filters.status)
  query.set('page', String(page))
  query.set('size', String(size))

  return apiRequest(`/orders?${query.toString()}`, { token })
}

export function fetchOrderById({ orderId, token }) {
  return apiRequest(`/orders/${orderId}`, { token })
}

export function fetchOrdersByCustomer({ customerId, page, size, token }) {
  return apiRequest(`/orders/customer/${customerId}?page=${page}&size=${size}`, {
    token,
  })
}

export function createOrder({ order, token }) {
  return apiRequest('/orders', {
    method: 'POST',
    body: order,
    token,
  })
}

export function updateOrderStatus({ orderId, status, token }) {
  return apiRequest(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status },
    token,
  })
}

export function cancelOrder({ orderId, token }) {
  return apiRequest(`/orders/${orderId}`, {
    method: 'DELETE',
    token,
  })
}

function addQueryParam(query, key, value) {
  if (value === '' || value === null || value === undefined) {
    return
  }

  query.set(key, String(value))
}
