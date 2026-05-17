import { apiRequest } from '../../../services/apiClient'

/*
 * Servicio frontend del modulo envios.
 * Todas las rutas pasan por API Gateway y usan el JWT de la sesion activa.
 */
export function fetchShipments({ filters = {}, page = 0, size = 20, token }) {
  const query = new URLSearchParams()
  if (filters.orderId) query.set('orderId', filters.orderId)
  if (filters.status) query.set('status', filters.status)
  if (filters.carrier) query.set('carrier', filters.carrier)
  if (filters.trackingNumber) query.set('trackingNumber', filters.trackingNumber)
  query.set('page', String(page))
  query.set('size', String(size))

  return apiRequest(`/shipping?${query.toString()}`, { token })
}

export function fetchShipmentById({ shipmentId, token }) {
  return apiRequest(`/shipping/${shipmentId}`, { token })
}

export function fetchShipmentByOrderId({ orderId, token }) {
  return apiRequest(`/shipping/order/${orderId}`, { token })
}

export function fetchShipmentByTrackingNumber({ trackingNumber, token }) {
  return apiRequest(`/shipping/tracking/${trackingNumber}`, { token })
}

export function fetchShipmentEvents({ shipmentId, token }) {
  return apiRequest(`/shipping/${shipmentId}/events`, { token })
}

export function createShipment({ shipment, token }) {
  return apiRequest('/shipping', {
    method: 'POST',
    body: shipment,
    token,
  })
}

export function updateShipment({ shipmentId, shipment, token }) {
  return apiRequest(`/shipping/${shipmentId}`, {
    method: 'PUT',
    body: shipment,
    token,
  })
}

export function updateShipmentStatus({
  description,
  location,
  occurredAt,
  shipmentId,
  status,
  token,
}) {
  return apiRequest(`/shipping/${shipmentId}/status`, {
    method: 'PATCH',
    body: { description, location, occurredAt, status },
    token,
  })
}

export function cancelShipment({ shipmentId, token }) {
  return apiRequest(`/shipping/${shipmentId}`, {
    method: 'DELETE',
    token,
  })
}
