import SessionCard from '../../auth/components/SessionCard'
import CustomerOrdersSection from './CustomerOrdersSection'
import '../styles/customer-dashboard.css'

/*
 * Dashboard para CLIENTE.
 * Mantiene al usuario en sus pedidos propios y reutiliza el JWT activo.
 */
function CustomerDashboard({ authSession }) {
  return (
    <main className="customer-dashboard">
      <header className="customer-header">
        <div>
          <p className="customer-kicker">SmartLogix Cliente</p>
          <h1>Portal de pedidos</h1>
        </div>
        <button
          className="customer-logout-button"
          onClick={authSession.handleLogout}
          type="button"
        >
          Cerrar sesi&oacute;n
        </button>
      </header>

      <div className="customer-layout">
        <aside className="customer-session">
          <SessionCard
            onLogout={authSession.handleLogout}
            roles={authSession.roles}
            session={authSession.session}
            userDisplayName={authSession.userDisplayName}
            userInitials={authSession.userInitials}
          />
        </aside>

        <div className="customer-content">
          <CustomerOrdersSection session={authSession.session} />
        </div>
      </div>
    </main>
  )
}

export default CustomerDashboard
