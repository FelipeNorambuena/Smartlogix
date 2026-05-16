import { useState } from 'react'
import { useShippingAdmin } from '../hooks/useShippingAdmin'
import '../../orders/styles/orders-section.css'

function ShippingSection({ session }) {
  const shippingAdmin = useShippingAdmin(session)

  return (
    <section className="orders-section" aria-label="Envíos">
      <div className="orders-header">
        <div>
          <p className="orders-kicker">Envíos</p>
          <h2>Gestión de Envíos</h2>
        </div>
        <button
          className="orders-ghost-button"
          disabled={shippingAdmin.isLoading}
          onClick={() => shippingAdmin.loadShipments()}
          type="button"
        >
          {shippingAdmin.isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {(shippingAdmin.successMessage || shippingAdmin.errorMessage) && (
        <div className="orders-messages">
          {shippingAdmin.errorMessage && <p className="orders-error">{shippingAdmin.errorMessage}</p>}
          {shippingAdmin.successMessage && <p className="orders-success">{shippingAdmin.successMessage}</p>}
        </div>
      )}

      <div className="orders-summary" aria-label="Resumen de envíos">
        <div className="summary-item">
          <strong>Envíos Totales</strong>
          <span>{shippingAdmin.totalElements}</span>
        </div>
      </div>

      <div className="orders-accordion">
        <div className="orders-collapsible-section admin-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Listado de envíos</h3>
          
          <form onSubmit={shippingAdmin.submitFilters} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input 
              name="orderId" 
              placeholder="Id Pedido" 
              value={shippingAdmin.filters.orderId} 
              onChange={shippingAdmin.handleFilterChange} 
              className="orders-input"
            />
            <input 
               name="trackingNumber" 
               placeholder="Tracking Number" 
               value={shippingAdmin.filters.trackingNumber} 
               onChange={shippingAdmin.handleFilterChange} 
               className="orders-input"
            />
            <select name="status" value={shippingAdmin.filters.status} onChange={shippingAdmin.handleFilterChange} className="orders-input">
              <option value="">Cualquier estado</option>
              {shippingAdmin.SHIPMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="submit" disabled={shippingAdmin.isLoading} className="orders-primary-button">Filtrar</button>
            <button type="button" onClick={shippingAdmin.clearFilters} disabled={shippingAdmin.isLoading} className="orders-ghost-button">Limpiar</button>
          </form>

          {shippingAdmin.shipments.length > 0 ? (
             <table className="orders-table">
               <thead>
                 <tr>
                   <th>ID</th>
                   <th>ID Pedido</th>
                   <th>Carrier</th>
                   <th>Tracking</th>
                   <th>Estado</th>
                 </tr>
               </thead>
               <tbody>
                 {shippingAdmin.shipments.map(s => (
                   <tr key={s.id}>
                     <td>{s.id}</td>
                     <td>{s.orderId}</td>
                     <td>{s.carrier}</td>
                     <td>{s.trackingNumber}</td>
                     <td>{s.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          ) : (
            <p>No se encontraron envíos.</p>
          )}

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              disabled={shippingAdmin.page === 0} 
              onClick={() => shippingAdmin.goToPage(shippingAdmin.page - 1)}
              className="orders-ghost-button"
            >
              Anterior
            </button>
            <span>Página {shippingAdmin.page + 1} de {Math.max(1, shippingAdmin.totalPages)}</span>
            <button 
              disabled={shippingAdmin.page >= shippingAdmin.totalPages - 1} 
              onClick={() => shippingAdmin.goToPage(shippingAdmin.page + 1)}
              className="orders-ghost-button"
            >
              Siguiente
            </button>
          </div>
        </div>

        <div className="orders-collapsible-section admin-card" style={{ padding: '20px', marginTop: '16px' }}>
          <h3 style={{ marginBottom: '16px' }}>Buscar envío por ID</h3>
          <form onSubmit={(e) => { e.preventDefault(); shippingAdmin.loadShipmentById(shippingAdmin.lookup.shipmentId); }} style={{ display: 'flex', gap: '8px' }}>
            <input 
              placeholder="UUID del envío"
              value={shippingAdmin.lookup.shipmentId}
              onChange={(e) => shippingAdmin.setLookup({ shipmentId: e.target.value })}
              className="orders-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="orders-primary-button" disabled={shippingAdmin.isLoading || !shippingAdmin.lookup.shipmentId}>
              Buscar
            </button>
          </form>

          {shippingAdmin.selectedShipment && (
            <div style={{ marginTop: '16px', background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
              <p><strong>ID:</strong> {shippingAdmin.selectedShipment.id}</p>
              <p><strong>Estado Actual:</strong> {shippingAdmin.selectedShipment.status}</p>
              <p><strong>Carrier:</strong> {shippingAdmin.selectedShipment.carrier} - <strong>Tracking:</strong> {shippingAdmin.selectedShipment.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ShippingSection
