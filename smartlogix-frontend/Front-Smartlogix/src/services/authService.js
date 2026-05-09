import { apiRequest } from './apiClient'

/*
 * Cliente HTTP de autenticacion.
 * La UI no conoce rutas internas de microservicios; solo consume el API Gateway.
 */
export async function loginUser(credentials) {
  // El auth-service debe responder con token, tokenType, expiresAt y user.
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  })
}
