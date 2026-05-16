import SessionCard from '../../auth/components/SessionCard'
import OrdersSection from '../../orders/components/OrdersSection'
import '../styles/orders-operator-dashboard.css'

/*
 * Panel exclusivo para OPERADOR_PEDIDOS.
 * Reutiliza el modulo de pedidos sin exponer la creacion de ordenes.
 */
function OrdersOperatorDashboard({ authSession }) {
  return (
    <main className="orders-operator-dashboard">
      <header className="orders-operator-header">
        <div>
          <p className="orders-operator-kicker">SmartLogix Pedidos</p>
          <h1>Panel de pedidos</h1>
        </div>
        <button
          className="orders-operator-logout-button"
          onClick={authSession.handleLogout}
          type="button"
        >
          Cerrar sesi&oacute;n
        </button>
      </header>

      <div className="orders-operator-layout">
        <aside className="orders-operator-session">
          <SessionCard
            onLogout={authSession.handleLogout}
            roles={authSession.roles}
            session={authSession.session}
            userDisplayName={authSession.userDisplayName}
            userInitials={authSession.userInitials}
          />
        </aside>

        <div className="orders-operator-content">
          <OrdersSection
            allowCreate={false}
            initialOpenSections={{ list: true, status: true }}
            session={authSession.session}
          />
        </div>
      </div>
    </main>
  )
}

export default OrdersOperatorDashboard
