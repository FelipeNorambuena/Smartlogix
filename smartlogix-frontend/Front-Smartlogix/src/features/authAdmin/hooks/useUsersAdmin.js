import { useState } from 'react'
import {
  createUser,
  fetchUserById,
  fetchUsers,
  updateUser,
  updateUserRoles,
  updateUserStatus,
} from '../services/userService'

const AVAILABLE_ROLES = [
  'ADMIN',
  'OPERADOR_INVENTARIO',
  'OPERADOR_PEDIDOS',
  'OPERADOR_ENVIOS',
  'CLIENTE',
]

const INITIAL_USER_FORM = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  roles: ['CLIENTE'],
  enabled: true,
}

const INITIAL_EDIT_FORM = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  roles: [],
  enabled: true,
}

/*
 * Hook de administracion de usuarios.
 * Mantiene la UI aislada del contrato HTTP del auth-service.
 */
export function useUsersAdmin(session) {
  const [users, setUsers] = useState([])
  const [userForm, setUserForm] = useState(INITIAL_USER_FORM)
  const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM)
  const [lookupId, setLookupId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadUsers() {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetchUsers({ token: session.token })
      setUsers(response || [])
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleUserFormChange(event) {
    const { checked, name, type, value } = event.target

    setUserForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleEditFormChange(event) {
    const { checked, name, type, value } = event.target

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function toggleCreateRole(role) {
    setUserForm((currentForm) => ({
      ...currentForm,
      roles: toggleRole(currentForm.roles, role),
    }))
  }

  function toggleEditRole(role) {
    setEditForm((currentForm) => ({
      ...currentForm,
      roles: toggleRole(currentForm.roles, role),
    }))
  }

  function resetCreateForm() {
    // Limpia la creacion sin enviar datos al auth-service.
    setUserForm(INITIAL_USER_FORM)
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleCreateUser(event) {
    event.preventDefault()

    const validationMessage = validateCreateForm(userForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      setSuccessMessage('')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await createUser({
        token: session.token,
        user: buildCreatePayload(userForm),
      })
      setUserForm(INITIAL_USER_FORM)
      setSuccessMessage('Usuario creado correctamente.')
      await loadUsers()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSearchUser() {
    if (!lookupId.trim()) {
      setErrorMessage('Ingresa el ID del usuario.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const user = await fetchUserById({ token: session.token, userId: lookupId.trim() })
      setEditForm(mapUserToEditForm(user))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function selectUserForEdit(user) {
    // Permite editar desde la tabla sin copiar manualmente el ID.
    setLookupId(String(user.id))
    setEditForm(mapUserToEditForm(user))
    setErrorMessage('')
    setSuccessMessage('')
  }

  function resetEditSearch() {
    // Cancela cambios locales y deja la busqueda lista para otro ID.
    setLookupId('')
    setEditForm(INITIAL_EDIT_FORM)
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleUpdateUser(event) {
    event.preventDefault()

    if (!editForm.id) {
      setErrorMessage('Busca un usuario antes de actualizar.')
      return
    }

    const validationMessage = validateEditForm(editForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const updatedUser = await updateUser({
        token: session.token,
        userId: editForm.id,
        user: buildUpdatePayload(editForm),
      })
      setEditForm(mapUserToEditForm(updatedUser))
      setSuccessMessage('Usuario actualizado correctamente.')
      await loadUsers()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateRoles() {
    if (!editForm.id) {
      setErrorMessage('Busca un usuario antes de actualizar roles.')
      return
    }

    if (editForm.roles.length === 0) {
      setErrorMessage('Selecciona al menos un rol.')
      return
    }

    await patchSelectedUser(() =>
      updateUserRoles({
        roles: editForm.roles,
        token: session.token,
        userId: editForm.id,
      }),
      'Roles actualizados correctamente.',
    )
  }

  async function handleUpdateStatus() {
    if (!editForm.id) {
      setErrorMessage('Busca un usuario antes de cambiar estado.')
      return
    }

    await patchSelectedUser(() =>
      updateUserStatus({
        enabled: editForm.enabled,
        token: session.token,
        userId: editForm.id,
      }),
      'Estado actualizado correctamente.',
    )
  }

  async function patchSelectedUser(requestFactory, message) {
    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const updatedUser = await requestFactory()
      setEditForm(mapUserToEditForm(updatedUser))
      setSuccessMessage(message)
      await loadUsers()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    availableRoles: AVAILABLE_ROLES,
    editForm,
    errorMessage,
    handleCreateUser,
    handleEditFormChange,
    handleSearchUser,
    handleUpdateRoles,
    handleUpdateStatus,
    handleUpdateUser,
    handleUserFormChange,
    isLoading,
    isSaving,
    loadUsers,
    lookupId,
    resetCreateForm,
    resetEditSearch,
    selectUserForEdit,
    setLookupId,
    successMessage,
    toggleCreateRole,
    toggleEditRole,
    userForm,
    users,
  }
}

function toggleRole(roles, role) {
  if (roles.includes(role)) {
    return roles.filter((currentRole) => currentRole !== role)
  }

  return [...roles, role]
}

function buildCreatePayload(form) {
  return {
    email: form.email.trim(),
    password: form.password,
    firstName: normalizeOptionalText(form.firstName),
    lastName: normalizeOptionalText(form.lastName),
    roles: form.roles,
    enabled: form.enabled,
  }
}

function buildUpdatePayload(form) {
  return {
    email: form.email.trim(),
    firstName: normalizeOptionalText(form.firstName),
    lastName: normalizeOptionalText(form.lastName),
  }
}

function mapUserToEditForm(user) {
  return {
    id: user.id,
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    roles: user.roles || [],
    enabled: Boolean(user.enabled),
  }
}

function normalizeOptionalText(value) {
  const normalized = value.trim()
  return normalized ? normalized : null
}

function validateCreateForm(form) {
  if (!isValidEmail(form.email)) {
    return 'Ingresa un correo valido.'
  }

  if (form.password.length < 8) {
    return 'La password debe tener al menos 8 caracteres.'
  }

  if (form.roles.length === 0) {
    return 'Selecciona al menos un rol.'
  }

  return ''
}

function validateEditForm(form) {
  if (!isValidEmail(form.email)) {
    return 'Ingresa un correo valido.'
  }

  return ''
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
