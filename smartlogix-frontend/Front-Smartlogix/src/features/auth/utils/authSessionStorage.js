import { AUTH_STORAGE_KEY } from '../constants/authConstants'

/*
 * Carga una sesion previa desde storage.
 * Se revisan ambos storages porque el usuario puede elegir recordar sesion.
 */
export function loadStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const storedSession =
    window.localStorage.getItem(AUTH_STORAGE_KEY) ||
    window.sessionStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedSession) {
    return null
  }

  try {
    return JSON.parse(storedSession)
  } catch {
    // Si el JSON esta corrupto, se limpia para no bloquear futuros logins.
    clearStoredSession()
    return null
  }
}

/*
 * Persiste solo los datos necesarios para reconstruir la sesion del frontend.
 */
export function persistSession(authData, rememberSession) {
  const sessionPayload = {
    token: authData.token,
    tokenType: authData.tokenType || 'Bearer',
    expiresAt: authData.expiresAt,
    user: authData.user,
    createdAt: new Date().toISOString(),
  }

  // Se guarda en un solo storage para evitar estados de sesion duplicados.
  clearStoredSession()

  const storage = rememberSession ? window.localStorage : window.sessionStorage
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload))

  return sessionPayload
}

export function clearStoredSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
