import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './apiClient'

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Guia: valida que sends JSON body and Bearer token through the API Gateway.
  it('sends JSON body and Bearer token through the API Gateway', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ id: 'order-1' }), {
        status: 200,
      }),
    )

    const response = await apiRequest('/orders', {
      body: { shippingAddress: 'Santiago Centro 123' },
      method: 'POST',
      token: 'jwt-token',
    })

    expect(response).toEqual({ id: 'order-1' })
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/orders',
      expect.objectContaining({
        body: JSON.stringify({ shippingAddress: 'Santiago Centro 123' }),
        headers: {
          Authorization: 'Bearer jwt-token',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    )
  })

  // Guia: valida que uses API error message when the backend returns a JSON error body.
  it('uses API error message when the backend returns a JSON error body', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'No tienes permisos' }), {
        status: 403,
      }),
    )

    await expect(apiRequest('/users', { token: 'cliente-token' })).rejects.toThrow(
      'No tienes permisos',
    )
  })

  // Guia: valida que returns null for valid empty responses.
  it('returns null for valid empty responses', async () => {
    fetch.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiRequest('/orders/order-1', { method: 'DELETE' })).resolves.toBeNull()
  })
})
