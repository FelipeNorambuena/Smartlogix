import SessionCard from '../../auth/components/SessionCard'
import InventorySection from '../../inventory/components/InventorySection'
import '../styles/inventory-operator-dashboard.css'

/*
 * Panel exclusivo para OPERADOR_INVENTARIO.
 * Mantiene al usuario dentro del dominio inventario y reutiliza el flujo REST
 * que ya pasa por el API Gateway con Authorization: Bearer TOKEN.
 */
function InventoryOperatorDashboard({ authSession }) {
  return (
    <main className="inventory-operator-dashboard">
      <header className="inventory-operator-header">
        <div>
          <p className="inventory-operator-kicker">SmartLogix Inventario</p>
          <h1>Panel de inventario</h1>
        </div>
        <button
          className="inventory-operator-logout-button"
          onClick={authSession.handleLogout}
          type="button"
        >
          Cerrar sesi&oacute;n
        </button>
      </header>

      <div className="inventory-operator-layout">
        <aside className="inventory-operator-session">
          <SessionCard
            onLogout={authSession.handleLogout}
            roles={authSession.roles}
            session={authSession.session}
            userDisplayName={authSession.userDisplayName}
            userInitials={authSession.userInitials}
          />
        </aside>

        <div className="inventory-operator-content">
          <InventorySection session={authSession.session} />
        </div>
      </div>
    </main>
  )
}

export default InventoryOperatorDashboard
