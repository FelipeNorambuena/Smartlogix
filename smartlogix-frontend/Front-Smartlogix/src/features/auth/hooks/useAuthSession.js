import { useMemo, useState } from 'react'
import { loginUser } from '../../../services/authService'
import { INITIAL_LOGIN_FORM } from '../constants/authConstants'
import {
  clearStoredSession,
  loadStoredSession,
  persistSession,
} from '../utils/authSessionStorage'

/*
 * Hook central del modulo auth.
 * Agrupa estado del formulario, login, logout y datos derivados de usuario.
 */
export function useAuthSession() {
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM)
  const [session, setSession] = useState(loadStoredSession)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Nombre visible: privilegia nombre/apellido y usa el email como respaldo.
  const userDisplayName = useMemo(() => {
    if (!session?.user) {
      return ''
    }

    const fullName = [session.user.firstName, session.user.lastName]
      .filter(Boolean)
      .join(' ')

    return fullName || session.user.email
  }, [session])

  // Iniciales usadas como avatar cuando no existe imagen de perfil.
  const userInitials = useMemo(() => {
    if (!userDisplayName) {
      return 'SL'
    }

    return userDisplayName
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }, [userDisplayName])

  const roles = session?.user?.roles || []

  function handleInputChange(event) {
    const { checked, name, type, value } = event.target

    setLoginForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleLoginSubmit(event) {
    event.preventDefault()

    // Se valida en cliente antes de llamar al API Gateway.
    const validationMessage = validateLoginForm(loginForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      // El servicio HTTP mantiene el contrato con auth-service aislado de la UI.
      const authData = await loginUser({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })

      const nextSession = persistSession(authData, loginForm.rememberSession)
      setSession(nextSession)
      // Se limpia password despues de un login correcto.
      setLoginForm({
        ...INITIAL_LOGIN_FORM,
        rememberSession: loginForm.rememberSession,
      })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLogout() {
    clearStoredSession()
    setSession(null)
  }

  function togglePasswordVisibility() {
    setShowPassword((currentValue) => !currentValue)
  }

  return {
    errorMessage,
    handleInputChange,
    handleLoginSubmit,
    handleLogout,
    isSubmitting,
    loginForm,
    roles,
    session,
    showPassword,
    togglePasswordVisibility,
    userDisplayName,
    userInitials,
  }
}

function validateLoginForm(loginForm) {
  // Validacion minima de UX; las reglas definitivas siguen en el backend.
  if (!loginForm.email.trim()) {
    return 'Ingresa el correo del usuario.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email.trim())) {
    return 'Ingresa un correo v\u00e1lido.'
  }

  if (!loginForm.password) {
    return 'Ingresa la contrase\u00f1a.'
  }

  return ''
}
