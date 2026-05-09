import { useAuthSession } from '../hooks/useAuthSession'
import '../styles/auth-page.css'
import BrandPanel from './BrandPanel'
import LoginForm from './LoginForm'
import SessionCard from './SessionCard'

function LoginPage() {
  const authSession = useAuthSession()

  return (
    <main className="login-page">
      <BrandPanel />

      <section className="auth-panel" aria-label="Inicio de sesi&oacute;n">
        <div className="auth-shell">
          <h1 className="auth-page-title">Plataforma log&iacute;stica</h1>

          <div className="auth-card">
            {authSession.session ? (
              <SessionCard
                onLogout={authSession.handleLogout}
                roles={authSession.roles}
                session={authSession.session}
                userDisplayName={authSession.userDisplayName}
                userInitials={authSession.userInitials}
              />
            ) : (
              <LoginForm
                errorMessage={authSession.errorMessage}
                isSubmitting={authSession.isSubmitting}
                loginForm={authSession.loginForm}
                onInputChange={authSession.handleInputChange}
                onSubmit={authSession.handleLoginSubmit}
                onTogglePassword={authSession.togglePasswordVisibility}
                showPassword={authSession.showPassword}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
