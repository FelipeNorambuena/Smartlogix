import '../styles/login-form.css'

/*
 * Formulario controlado de inicio de sesion.
 * La logica se recibe desde useAuthSession para mantener la UI desacoplada.
 */
function LoginForm({
  authMode,
  errorMessage,
  isSubmitting,
  loginForm,
  onInputChange,
  onPasswordResetInputChange,
  onPasswordResetSubmit,
  onShowLogin,
  onShowPasswordReset,
  onSubmit,
  onTogglePassword,
  onToggleResetPassword,
  passwordResetForm,
  showPassword,
  showResetPassword,
  successMessage,
}) {
  if (authMode === 'password-reset') {
    return (
      <>
        <div className="auth-heading">
          <h2>Recuperar contrase&ntilde;a</h2>
        </div>

        <form className="login-form" onSubmit={onPasswordResetSubmit}>
          <div className="field-group">
            <label htmlFor="reset-email">Correo electr&oacute;nico</label>
            <input
              autoComplete="email"
              id="reset-email"
              name="email"
              onChange={onPasswordResetInputChange}
              placeholder="usuario@smartlogix.cl"
              type="email"
              value={passwordResetForm.email}
            />
          </div>

          <div className="field-group">
            <label htmlFor="newPassword">Nueva contrase&ntilde;a</label>
            <div className="password-field">
              <input
                autoComplete="new-password"
                id="newPassword"
                name="newPassword"
                onChange={onPasswordResetInputChange}
                placeholder="Minimo 8 caracteres"
                type={showResetPassword ? 'text' : 'password'}
                value={passwordResetForm.newPassword}
              />
              <button
                aria-label={
                  showResetPassword
                    ? 'Ocultar contrase\u00f1a'
                    : 'Mostrar contrase\u00f1a'
                }
                className="text-button"
                onClick={onToggleResetPassword}
                type="button"
              >
                {showResetPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <p className="error-message" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="success-message" role="status">
              {successMessage}
            </p>
          ) : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Actualizando...' : 'Actualizar clave'}
          </button>

          <button className="auth-switch-button" onClick={onShowLogin} type="button">
            Volver al inicio de sesi&oacute;n
          </button>
        </form>
      </>
    )
  }

  return (
    <>
      <div className="auth-heading">
        <h2>Iniciar sesi&oacute;n</h2>
      </div>

      <form className="login-form" onSubmit={onSubmit}>
        {/* El backend espera email y password en el body de /auth/login. */}
        <div className="field-group">
          <label htmlFor="email">Correo electr&oacute;nico</label>
          <input
            autoComplete="email"
            id="email"
            name="email"
            onChange={onInputChange}
            placeholder="usuario@smartlogix.cl"
            type="email"
            value={loginForm.email}
          />
        </div>

        <div className="field-group">
          <label htmlFor="password">Contrase&ntilde;a</label>
          <div className="password-field">
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              onChange={onInputChange}
              placeholder="Ingresa tu contrase&ntilde;a"
              type={showPassword ? 'text' : 'password'}
              value={loginForm.password}
            />
            <button
              aria-label={
                showPassword
                  ? 'Ocultar contrase\u00f1a'
                  : 'Mostrar contrase\u00f1a'
              }
              className="text-button"
              onClick={onTogglePassword}
              type="button"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        <label className="check-row">
          {/* Permite elegir si el token queda en localStorage o sessionStorage. */}
          <input
            checked={loginForm.rememberSession}
            name="rememberSession"
            onChange={onInputChange}
            type="checkbox"
          />
          <span>Mantener sesi&oacute;n iniciada</span>
        </label>

        {errorMessage ? (
          <p className="error-message" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="success-message" role="status">
            {successMessage}
          </p>
        ) : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Validando...' : 'Entrar'}
        </button>

        <button className="auth-switch-button" onClick={onShowPasswordReset} type="button">
          Olvid&eacute; mi contrase&ntilde;a
        </button>
      </form>
    </>
  )
}

export default LoginForm
