import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LoginForm from './LoginForm'

describe('LoginForm', () => {
  // Guia: valida que renders login mode and calls submit handlers.
  it('renders login mode and calls submit handlers', async () => {
    const user = userEvent.setup()
    const onInputChange = vi.fn()
    const onShowPasswordReset = vi.fn()
    const onSubmit = vi.fn((event) => event.preventDefault())

    render(
      <LoginForm
        authMode="login"
        errorMessage=""
        isSubmitting={false}
        loginForm={{ email: '', password: '', rememberSession: true }}
        onInputChange={onInputChange}
        onPasswordResetInputChange={vi.fn()}
        onPasswordResetSubmit={vi.fn()}
        onShowLogin={vi.fn()}
        onShowPasswordReset={onShowPasswordReset}
        onSubmit={onSubmit}
        onTogglePassword={vi.fn()}
        onToggleResetPassword={vi.fn()}
        passwordResetForm={{ email: '', newPassword: '' }}
        showPassword={false}
        showResetPassword={false}
        successMessage=""
      />,
    )

    await user.type(screen.getByLabelText(/correo/i), 'cliente@smartlogix.com')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'Cliente12345')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    await user.click(screen.getByRole('button', { name: /olvidé mi contraseña/i }))

    expect(onInputChange).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalled()
    expect(onShowPasswordReset).toHaveBeenCalled()
  })

  // Guia: valida que renders password reset mode and exposes validation messages.
  it('renders password reset mode and exposes validation messages', async () => {
    const user = userEvent.setup()
    const onPasswordResetSubmit = vi.fn((event) => event.preventDefault())
    const onShowLogin = vi.fn()

    render(
      <LoginForm
        authMode="password-reset"
        errorMessage="La nueva contrasena debe tener al menos 8 caracteres."
        isSubmitting={false}
        loginForm={{ email: '', password: '', rememberSession: true }}
        onInputChange={vi.fn()}
        onPasswordResetInputChange={vi.fn()}
        onPasswordResetSubmit={onPasswordResetSubmit}
        onShowLogin={onShowLogin}
        onShowPasswordReset={vi.fn()}
        onSubmit={vi.fn()}
        onTogglePassword={vi.fn()}
        onToggleResetPassword={vi.fn()}
        passwordResetForm={{ email: '', newPassword: '' }}
        showPassword={false}
        showResetPassword={false}
        successMessage=""
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('La nueva contrasena')
    await user.click(screen.getByRole('button', { name: /actualizar clave/i }))
    await user.click(screen.getByRole('button', { name: /volver al inicio/i }))

    expect(onPasswordResetSubmit).toHaveBeenCalled()
    expect(onShowLogin).toHaveBeenCalled()
  })
})
