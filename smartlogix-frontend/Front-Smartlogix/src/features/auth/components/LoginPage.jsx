import { useAuthSession } from '../hooks/useAuthSession'
import '../styles/auth-page.css'
import AdminDashboard from '../../admin/components/AdminDashboard'
import CustomerDashboard from '../../customer/components/CustomerDashboard'
import InventoryOperatorDashboard from '../../inventoryOperator/components/InventoryOperatorDashboard'
import OrdersOperatorDashboard from '../../ordersOperator/components/OrdersOperatorDashboard'
import ShippingOperatorDashboard from '../../shippingOperator/components/ShippingOperatorDashboard'
import BrandPanel from './BrandPanel'
import LoginForm from './LoginForm'
import SessionCard from './SessionCard'

/*
 * Contenedor principal del modulo de autenticacion.
 * Decide si se muestra el formulario o la tarjeta de sesion activa.
 */
function LoginPage() {
  const authSession = useAuthSession()
  const isAdmin = authSession.roles.includes('ADMIN')
  const isInventoryOperator = authSession.roles.includes('OPERADOR_INVENTARIO')
  const isOrdersOperator = authSession.roles.includes('OPERADOR_PEDIDOS')
  const isShippingOperator = authSession.roles.includes('OPERADOR_ENVIOS')
  const isCustomer = authSession.roles.includes('CLIENTE')

  if (authSession.session && isAdmin) {
    return <AdminDashboard authSession={authSession} />
  }

  if (authSession.session && isOrdersOperator) {
    return <OrdersOperatorDashboard authSession={authSession} />
  }

  if (authSession.session && isShippingOperator) {
    return <ShippingOperatorDashboard authSession={authSession} />
  }

  if (authSession.session && isInventoryOperator) {
    return <InventoryOperatorDashboard authSession={authSession} />
  }

  if (authSession.session && isCustomer) {
    return <CustomerDashboard authSession={authSession} />
  }

  return (
    <main className="login-page">
      <BrandPanel />

      <section className="auth-panel" aria-label="Inicio de sesi&oacute;n">
        <div className="auth-shell">
          <h1 className="auth-page-title">Plataforma log&iacute;stica</h1>

          <div className="auth-card">
            {/* La vista cambia segun exista una sesion guardada o recien autenticada. */}
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
                authMode={authSession.authMode}
                errorMessage={authSession.errorMessage}
                isSubmitting={authSession.isSubmitting}
                loginForm={authSession.loginForm}
                onInputChange={authSession.handleInputChange}
                onPasswordResetInputChange={authSession.handlePasswordResetInputChange}
                onPasswordResetSubmit={authSession.handlePasswordResetSubmit}
                onShowLogin={authSession.showLoginForm}
                onShowPasswordReset={authSession.showPasswordResetForm}
                onSubmit={authSession.handleLoginSubmit}
                onTogglePassword={authSession.togglePasswordVisibility}
                onToggleResetPassword={authSession.toggleResetPasswordVisibility}
                passwordResetForm={authSession.passwordResetForm}
                showPassword={authSession.showPassword}
                showResetPassword={authSession.showResetPassword}
                successMessage={authSession.successMessage}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
