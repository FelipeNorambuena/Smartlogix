import { useState } from 'react'
import { fetchUsers } from '../../authAdmin/services/userService'
import { fetchInventory } from '../../inventory/services/inventoryService'
import '../styles/admin-home.css'

/*
 * Inicio analitico del panel ADMIN.
 * Carga metricas desde auth-service e inventario usando el API Gateway.
 */
function AdminHome({ session }) {
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadAnalytics() {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [users, inventoryPage] = await Promise.all([
        fetchUsers({ token: session.token }),
        fetchInventory({
          filters: { lowStock: '', sku: '', warehouseLocation: '' },
          page: 0,
          size: 100,
          token: session.token,
        }),
      ])

      setAnalytics(buildAnalytics(users || [], inventoryPage?.content || []))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const data = analytics || buildAnalytics([], [])

  return (
    <section className="admin-home" aria-label="Inicio administrativo">
      <div className="admin-home-header">
        <div>
          <p className="admin-home-kicker">Analítica operativa</p>
          <h2>Inicio</h2>
        </div>
        <button className="admin-home-button" disabled={isLoading} onClick={loadAnalytics} type="button">
          {isLoading ? 'Actualizando...' : 'Actualizar analítica'}
        </button>
      </div>

      {errorMessage ? (
        <p className="admin-home-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="analytics-cards">
        <MetricCard label="Usuarios" value={data.totalUsers} />
        <MetricCard label="Usuarios activos" value={data.enabledUsers} />
        <MetricCard label="Productos con stock" value={data.inventoryCount} />
        <MetricCard label="Bajo stock" value={data.lowStockCount} />
      </div>

      <div className="analytics-grid">
        <RoleChart roles={data.roles} totalUsers={data.totalUsers} />
        <StockChart data={data.stock} />
      </div>
    </section>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function RoleChart({ roles, totalUsers }) {
  return (
    <div className="analytics-panel">
      <div className="analytics-heading">
        <h3>Distribuci&oacute;n de roles</h3>
        <p>Usuarios por rol desde auth-service.</p>
      </div>

      <div className="bar-chart">
        {roles.map((role) => {
          const width = totalUsers === 0 ? 0 : Math.round((role.count / totalUsers) * 100)

          return (
            <div className="bar-row" key={role.name}>
              <div className="bar-label">
                <span>{role.name}</span>
                <strong>{role.count}</strong>
              </div>
              <div className="bar-track">
                <span style={{ width: `${width}%` }}></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StockChart({ data }) {
  const maxValue = Math.max(data.available, data.reserved, data.free, 1)

  return (
    <div className="analytics-panel">
      <div className="analytics-heading">
        <h3>Inventario agregado</h3>
        <p>Unidades calculadas desde inventario.</p>
      </div>

      <div className="column-chart">
        {[
          { label: 'Disponible', value: data.available },
          { label: 'Reservado', value: data.reserved },
          { label: 'Libre', value: data.free },
        ].map((item) => (
          <div className="column-item" key={item.label}>
            <div className="column-track">
              <span style={{ height: `${Math.max((item.value / maxValue) * 100, 4)}%` }}></span>
            </div>
            <strong>{item.value}</strong>
            <small>{item.label}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildAnalytics(users, inventoryItems) {
  const roleMap = users.reduce((currentRoles, user) => {
    ;(user.roles || []).forEach((role) => {
      currentRoles[role] = (currentRoles[role] || 0) + 1
    })
    return currentRoles
  }, {})

  const stock = inventoryItems.reduce(
    (currentStock, item) => ({
      available: currentStock.available + item.stockAvailable,
      free: currentStock.free + item.stockAvailable - item.stockReserved,
      reserved: currentStock.reserved + item.stockReserved,
    }),
    { available: 0, free: 0, reserved: 0 },
  )

  return {
    enabledUsers: users.filter((user) => user.enabled).length,
    inventoryCount: inventoryItems.length,
    lowStockCount: inventoryItems.filter((item) => item.stockAvailable <= item.reorderPoint).length,
    roles: Object.entries(roleMap).map(([name, count]) => ({ count, name })),
    stock,
    totalUsers: users.length,
  }
}

export default AdminHome
