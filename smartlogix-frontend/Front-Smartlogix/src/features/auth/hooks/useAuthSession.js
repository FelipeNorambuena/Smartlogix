import { useMemo, useState } from 'react'
import { loginUser } from '../../../services/authService'
import { INITIAL_LOGIN_FORM } from '../constants/authConstants'
import {
  clearStoredSession,
  loadStoredSession,
  persistSession,
} from '../utils/authSessionStorage'

export function useAuthSession() {
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM)
  const [session, setSession] = useState(loadStoredSession)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const userDisplayName = useMemo(() => {
    if (!session?.user) {
      return ''
    }

    const fullName = [session.user.firstName, session.user.lastName]
      .filter(Boolean)
      .join(' ')

    return fullName || session.user.email
  }, [session])

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

    const validationMessage = validateLoginForm(loginForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const authData = await loginUser({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })

      const nextSession = persistSession(authData, loginForm.rememberSession)
      setSession(nextSession)
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
