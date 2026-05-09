import '../styles/login-form.css'

/*
 * Formulario controlado de inicio de sesion.
 * La logica se recibe desde useAuthSession para mantener la UI desacoplada.
 */
function LoginForm({
  errorMessage,
  isSubmitting,
  loginForm,
  onInputChange,
  onSubmit,
  onTogglePassword,
  showPassword,
}) {
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

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Validando...' : 'Entrar'}
        </button>
      </form>
    </>
  )
}

export default LoginForm
