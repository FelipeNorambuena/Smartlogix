import SessionCard from '../../auth/components/SessionCard'
import ShippingSection from '../../shipping/components/ShippingSection'
import '../styles/shipping-operator-dashboard.css'

/*
 * Panel exclusivo para OPERADOR_ENVIOS.
 * Reutiliza ShippingSection para que el operador y el administrador compartan
 * la misma logica de despacho a traves del API Gateway.
 */
function ShippingOperatorDashboard({ authSession }) {
  return (
    <main className="shipping-operator-dashboard">
      <header className="shipping-operator-header">
        <div>
          <p className="shipping-operator-kicker">SmartLogix Envios</p>
          <h1>Panel de envios</h1>
        </div>
        <button
          className="shipping-operator-logout-button"
          onClick={authSession.handleLogout}
          type="button"
        >
          Cerrar sesi&oacute;n
        </button>
      </header>

      <div className="shipping-operator-layout">
        <aside className="shipping-operator-session">
          <SessionCard
            onLogout={authSession.handleLogout}
            roles={authSession.roles}
            session={authSession.session}
            userDisplayName={authSession.userDisplayName}
            userInitials={authSession.userInitials}
          />
        </aside>

        <div className="shipping-operator-content">
          <ShippingSection
            initialOpenSections={{ list: true, status: true }}
            session={authSession.session}
          />
        </div>
      </div>
    </main>
  )
}

export default ShippingOperatorDashboard
