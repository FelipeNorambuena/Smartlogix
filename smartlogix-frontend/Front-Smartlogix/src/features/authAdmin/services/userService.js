import { apiRequest } from '../../../services/apiClient'

/*
 * Cliente frontend para administracion de usuarios.
 * Consume /users desde API Gateway, que enruta al auth-service.
 */
export function fetchUsers({ token }) {
  return apiRequest('/users', { token })
}

export function fetchUserById({ token, userId }) {
  return apiRequest(`/users/${userId}`, { token })
}

export function createUser({ token, user }) {
  return apiRequest('/users', {
    body: user,
    method: 'POST',
    token,
  })
}

export function updateUser({ token, user, userId }) {
  return apiRequest(`/users/${userId}`, {
    body: user,
    method: 'PUT',
    token,
  })
}

export function updateUserRoles({ roles, token, userId }) {
  return apiRequest(`/users/${userId}/roles`, {
    body: { roles },
    method: 'PATCH',
    token,
  })
}

export function updateUserStatus({ enabled, token, userId }) {
  return apiRequest(`/users/${userId}/status`, {
    body: { enabled },
    method: 'PATCH',
    token,
  })
}
