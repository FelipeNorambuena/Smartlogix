const DEFAULT_API_BASE_URL = 'http://localhost:8080'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '')

export async function loginUser(credentials) {
  let response

  try {
    // Toda autenticacion del frontend entra por el API Gateway.
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
  } catch {
    throw new Error(
      'No fue posible conectar con el API Gateway. Verifica que el backend est\u00e9 activo.',
    )
  }

  const payload = await readResponsePayload(response)

  if (!response.ok) {
    throw new Error(resolveErrorMessage(response.status, payload))
  }

  // El auth-service debe responder con token, tokenType, expiresAt y user.
  return payload
}

async function readResponsePayload(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function resolveErrorMessage(status, payload) {
  const apiMessage = payload?.message || payload?.error || payload?.detail

  if (apiMessage) {
    return apiMessage
  }

  if (status === 401 || status === 403) {
    return 'Credenciales inv\u00e1lidas o usuario sin permisos.'
  }

  if (status >= 500) {
    return 'El servicio de autenticaci\u00f3n no est\u00e1 disponible.'
  }

  return 'No fue posible iniciar sesi\u00f3n. Revisa los datos e intenta nuevamente.'
}
