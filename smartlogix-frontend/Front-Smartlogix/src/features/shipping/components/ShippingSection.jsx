import { useState } from 'react'
import { useShippingAdmin } from '../hooks/useShippingAdmin'
import '../../orders/styles/orders-section.css'

const DEFAULT_OPEN_SECTIONS = {
  create: false,
  detail: false,
  dispatchOrders: true,
  edit: false,
  events: false,
  list: true,
  lookup: false,
  status: true,
}

/*
 * Seccion operativa de envios.
 * La misma pieza sirve para ADMIN y OPERADOR_ENVIOS, manteniendo un unico flujo
 * frontend para crear, consultar, actualizar y cancelar despachos.
 */
function ShippingSection({ initialOpenSections, session }) {
  const shippingAdmin = useShippingAdmin(session)
  const [openSections, setOpenSections] = useState({
    ...DEFAULT_OPEN_SECTIONS,
    ...initialOpenSections,
  })

  function toggleSection(sectionId) {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [sectionId]: !currentSections[sectionId],
    }))
  }

  function handleSelectShipment(shipment) {
    shippingAdmin.selectShipment(shipment)
    setOpenSections((currentSections) => ({
      ...currentSections,
      detail: true,
      edit: true,
      events: true,
      status: true,
    }))
  }

  return (
    <section className="orders-section" aria-label="Envios">
      <div className="orders-header">
        <div>
          <p className="orders-kicker">Envios</p>
          <h2>Despachos y seguimiento</h2>
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

      <ShippingMessages shippingAdmin={shippingAdmin} />

      <div className="orders-summary" aria-label="Resumen de envios">
        <SummaryItem label="Envios" value={shippingAdmin.totalElements} />
        <SummaryItem label="Pedidos enviados" value={shippingAdmin.dispatchOrderTotalElements} />
        <SummaryItem label="Pendientes" value={shippingAdmin.summary.pending} />
        <SummaryItem label="Listos" value={shippingAdmin.summary.readyToShip} />
        <SummaryItem label="En ruta" value={shippingAdmin.summary.inTransit} />
      </div>

      <div className="orders-accordion">
        <CollapsibleShippingSection
          id="dispatchOrders"
          isOpen={openSections.dispatchOrders}
          meta={`${shippingAdmin.dispatchOrderTotalElements} pedidos`}
          onToggle={toggleSection}
          title="Pedidos para despacho"
        >
          <DispatchOrdersPanel shippingAdmin={shippingAdmin} />
        </CollapsibleShippingSection>

        <CollapsibleShippingSection
          id="list"
          isOpen={openSections.list}
          meta={`${shippingAdmin.totalElements} envios`}
          onToggle={toggleSection}
          title="Listado de envios"
        >
          <ShipmentList
            onSelectShipment={handleSelectShipment}
            shippingAdmin={shippingAdmin}
          />
        </CollapsibleShippingSection>

        <CollapsibleShippingSection
          id="create"
          isOpen={openSections.create}
          meta="Pedido confirmado o enviado"
          onToggle={toggleSection}
          title="Nuevo envio"
        >
          <ShipmentCreateForm shippingAdmin={shippingAdmin} />
        </CollapsibleShippingSection>

        <CollapsibleShippingSection
          id="lookup"
          isOpen={openSections.lookup}
          meta={shippingAdmin.selectedShipment?.id || 'ID, pedido o tracking'}
          onToggle={toggleSection}
          title="Buscar envio"
        >
          <ShipmentLookupPanel shippingAdmin={shippingAdmin} />
        </CollapsibleShippingSection>

        <CollapsibleShippingSection
          id="detail"
          isOpen={openSections.detail}
          meta={shippingAdmin.selectedShipment?.status || 'Selecciona un envio'}
          onToggle={toggleSection}
          title="Detalle del envio"
        >
          <ShipmentDetailPanel shippingAdmin={shippingAdmin} />
        </CollapsibleShippingSection>

        <CollapsibleShippingSection
          id="edit"
          isOpen={openSections.edit}
          meta={shippingAdmin.updateForm.shipmentId || 'Datos logisticos'}
          onToggle={toggleSection}
          title="Editar datos logisticos"
        >
          <ShipmentEditForm shippingAdmin={shippingAdmin} />
        </CollapsibleShippingSection>

        <CollapsibleShippingSection
          id="status"
          isOpen={openSections.status}
          meta={shippingAdmin.statusForm.shipmentId || 'Cambio de estado'}
          onToggle={toggleSection}
          title="Actualizar estado"
        >
          <ShipmentStatusPanel shippingAdmin={shippingAdmin} />
        </CollapsibleShippingSection>

        <CollapsibleShippingSection
          id="events"
          isOpen={openSections.events}
          meta={`${shippingAdmin.shipmentEvents.length} eventos`}
          onToggle={toggleSection}
          title="Historial de tracking"
        >
          <ShipmentEventsPanel shippingAdmin={shippingAdmin} />
        </CollapsibleShippingSection>
      </div>
    </section>
  )
}

function CollapsibleShippingSection({ children, id, isOpen, meta, onToggle, title }) {
  const contentId = `shipping-section-${id}`

  return (
    <article className="orders-disclosure">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="orders-disclosure-button"
        onClick={() => onToggle(id)}
        type="button"
      >
        <span className="orders-disclosure-main">
          <span className="orders-disclosure-title">{title}</span>
          {meta ? <span className="orders-disclosure-meta">{meta}</span> : null}
        </span>
        <span className="orders-disclosure-icon" aria-hidden="true">
          {isOpen ? '-' : '+'}
        </span>
      </button>

      {isOpen ? (
        <div className="orders-disclosure-content" id={contentId}>
          {children}
        </div>
      ) : null}
    </article>
  )
}

function ShippingMessages({ shippingAdmin }) {
  return (
    <>
      {shippingAdmin.errorMessage ? (
        <p className="orders-error" role="alert">
          {shippingAdmin.errorMessage}
        </p>
      ) : null}

      {shippingAdmin.successMessage ? (
        <p className="orders-success" role="status">
          {shippingAdmin.successMessage}
        </p>
      ) : null}
    </>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div className="orders-summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ShipmentList({ onSelectShipment, shippingAdmin }) {
  const canGoBack = shippingAdmin.page > 0
  const canGoNext = shippingAdmin.totalPages > 0 && shippingAdmin.page + 1 < shippingAdmin.totalPages

  return (
    <div className="orders-panel">
      <div className="orders-panel-heading">
        <div>
          <h3>Envios registrados</h3>
          <p>{shippingAdmin.totalElements} envios encontrados</p>
        </div>
        <button
          className="orders-ghost-button"
          disabled={shippingAdmin.isLoading}
          onClick={() => shippingAdmin.loadShipments()}
          type="button"
        >
          Recargar
        </button>
      </div>

      <form className="orders-filters shipping-filters" onSubmit={shippingAdmin.applyFilters}>
        <input
          name="orderId"
          onChange={shippingAdmin.handleFilterChange}
          placeholder="Pedido UUID"
          value={shippingAdmin.filters.orderId}
        />
        <input
          name="carrier"
          onChange={shippingAdmin.handleFilterChange}
          placeholder="Transportista"
          value={shippingAdmin.filters.carrier}
        />
        <input
          name="trackingNumber"
          onChange={shippingAdmin.handleFilterChange}
          placeholder="Tracking"
          value={shippingAdmin.filters.trackingNumber}
        />
        <select
          name="status"
          onChange={shippingAdmin.handleFilterChange}
          value={shippingAdmin.filters.status}
        >
          <option value="">Todos los estados</option>
          {shippingAdmin.SHIPMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
        <button className="orders-ghost-button" type="submit">
          Filtrar
        </button>
        <button className="orders-ghost-button" onClick={shippingAdmin.clearFilters} type="button">
          Limpiar
        </button>
      </form>

      <ShipmentsTable
        emptyMessage={shippingAdmin.isLoading ? 'Cargando envios...' : 'Sin envios para mostrar.'}
        onSelect={onSelectShipment}
        shipments={shippingAdmin.shipments}
      />

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={shippingAdmin.page}
        onNext={() => shippingAdmin.goToPage(shippingAdmin.page + 1)}
        onPrevious={() => shippingAdmin.goToPage(shippingAdmin.page - 1)}
        totalPages={shippingAdmin.totalPages}
      />
    </div>
  )
}

function DispatchOrdersPanel({ shippingAdmin }) {
  const canGoBack = shippingAdmin.dispatchOrderPage > 0
  const canGoNext =
    shippingAdmin.dispatchOrderTotalPages > 0 &&
    shippingAdmin.dispatchOrderPage + 1 < shippingAdmin.dispatchOrderTotalPages

  return (
    <div className="orders-panel">
      <div className="orders-panel-heading">
        <div>
          <h3>Pedidos listos para operar envio</h3>
          <p>
            {shippingAdmin.dispatchOrderTotalElements} pedidos encontrados en el estado seleccionado
          </p>
        </div>
        <button
          className="orders-ghost-button"
          disabled={shippingAdmin.isLoadingDispatchOrders}
          onClick={() => shippingAdmin.loadDispatchOrders()}
          type="button"
        >
          {shippingAdmin.isLoadingDispatchOrders ? 'Cargando...' : 'Recargar'}
        </button>
      </div>

      <form className="orders-filters" onSubmit={shippingAdmin.applyDispatchOrderFilters}>
        <select
          name="status"
          onChange={shippingAdmin.handleDispatchOrderFilterChange}
          value={shippingAdmin.dispatchOrderFilters.status}
        >
          <option value="SHIPPED">Pedidos enviados</option>
          <option value="CONFIRMED">Pedidos confirmados</option>
        </select>
        <button className="orders-ghost-button" type="submit">
          Filtrar
        </button>
      </form>

      <DispatchOrdersTable
        emptyMessage={
          shippingAdmin.isLoadingDispatchOrders
            ? 'Cargando pedidos...'
            : 'Sin pedidos para despacho.'
        }
        onCreateShipment={shippingAdmin.createShipmentFromOrder}
        orders={shippingAdmin.dispatchOrders}
        isSaving={shippingAdmin.isSaving}
      />

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={shippingAdmin.dispatchOrderPage}
        onNext={() => shippingAdmin.goToDispatchOrderPage(shippingAdmin.dispatchOrderPage + 1)}
        onPrevious={() => shippingAdmin.goToDispatchOrderPage(shippingAdmin.dispatchOrderPage - 1)}
        totalPages={shippingAdmin.dispatchOrderTotalPages}
      />
    </div>
  )
}

function ShipmentCreateForm({ shippingAdmin }) {
  return (
    <form className="orders-form" onSubmit={shippingAdmin.createNewShipment}>
      <div className="orders-form-grid">
        <ShippingField
          label="Pedido"
          name="orderId"
          onChange={shippingAdmin.handleShipmentFormChange}
          placeholder="UUID del pedido confirmado o enviado"
          value={shippingAdmin.shipmentForm.orderId}
        />
        <ShippingField
          label="Transportista"
          name="carrier"
          onChange={shippingAdmin.handleShipmentFormChange}
          placeholder="Blue Express"
          value={shippingAdmin.shipmentForm.carrier}
        />
        <ShippingField
          label="Tracking"
          name="trackingNumber"
          onChange={shippingAdmin.handleShipmentFormChange}
          placeholder="TRK-000001"
          value={shippingAdmin.shipmentForm.trackingNumber}
        />
        <label className="orders-field orders-field-wide">
          <span>Direccion de envio</span>
          <textarea
            name="shippingAddress"
            onChange={shippingAdmin.handleShipmentFormChange}
            placeholder="Si queda vacia, envios usa la direccion del pedido."
            rows="3"
            value={shippingAdmin.shipmentForm.shippingAddress}
          ></textarea>
        </label>
      </div>

      <div className="orders-actions">
        <button className="orders-primary-button" disabled={shippingAdmin.isSaving} type="submit">
          {shippingAdmin.isSaving ? 'Creando...' : 'Crear envio'}
        </button>
      </div>
    </form>
  )
}

function ShipmentLookupPanel({ shippingAdmin }) {
  return (
    <div className="orders-panel">
      <form
        className="orders-lookup"
        onSubmit={(event) => {
          event.preventDefault()
          shippingAdmin.loadShipmentById()
        }}
      >
        <input
          name="shipmentId"
          onChange={shippingAdmin.handleLookupChange}
          placeholder="ID del envio"
          value={shippingAdmin.lookup.shipmentId}
        />
        <button className="orders-ghost-button" disabled={shippingAdmin.isLoading} type="submit">
          Buscar ID
        </button>
      </form>

      <form className="orders-lookup" onSubmit={shippingAdmin.loadShipmentByOrder}>
        <input
          name="orderId"
          onChange={shippingAdmin.handleLookupChange}
          placeholder="ID del pedido"
          value={shippingAdmin.lookup.orderId}
        />
        <button className="orders-ghost-button" disabled={shippingAdmin.isLoading} type="submit">
          Buscar pedido
        </button>
      </form>

      <form className="orders-lookup" onSubmit={shippingAdmin.loadShipmentByTracking}>
        <input
          name="trackingNumber"
          onChange={shippingAdmin.handleLookupChange}
          placeholder="Codigo de tracking"
          value={shippingAdmin.lookup.trackingNumber}
        />
        <button className="orders-ghost-button" disabled={shippingAdmin.isLoading} type="submit">
          Buscar tracking
        </button>
      </form>
    </div>
  )
}

function ShipmentDetailPanel({ shippingAdmin }) {
  if (!shippingAdmin.selectedShipment) {
    return (
      <p className="orders-empty-note">
        Selecciona un envio desde la tabla o usa la busqueda por ID, pedido o tracking.
      </p>
    )
  }

  return <ShipmentDetail shipment={shippingAdmin.selectedShipment} />
}

function ShipmentEditForm({ shippingAdmin }) {
  return (
    <form className="orders-form" onSubmit={shippingAdmin.updateShipmentDetails}>
      <div className="orders-form-grid">
        <ShippingField
          label="Envio"
          name="shipmentId"
          onChange={shippingAdmin.handleUpdateFormChange}
          placeholder="UUID del envio"
          value={shippingAdmin.updateForm.shipmentId}
        />
        <ShippingField
          label="Transportista"
          name="carrier"
          onChange={shippingAdmin.handleUpdateFormChange}
          placeholder="Transportista asignado"
          value={shippingAdmin.updateForm.carrier}
        />
        <ShippingField
          label="Tracking"
          name="trackingNumber"
          onChange={shippingAdmin.handleUpdateFormChange}
          placeholder="Codigo de tracking"
          value={shippingAdmin.updateForm.trackingNumber}
        />
        <label className="orders-field orders-field-wide">
          <span>Direccion de envio</span>
          <textarea
            name="shippingAddress"
            onChange={shippingAdmin.handleUpdateFormChange}
            placeholder="Direccion actualizada"
            rows="3"
            value={shippingAdmin.updateForm.shippingAddress}
          ></textarea>
        </label>
      </div>

      <div className="orders-actions">
        <button
          className="orders-primary-button"
          disabled={shippingAdmin.isSaving || !shippingAdmin.updateForm.shipmentId}
          type="submit"
        >
          Guardar datos
        </button>
      </div>
    </form>
  )
}

function ShipmentStatusPanel({ shippingAdmin }) {
  const canCancel =
    shippingAdmin.statusForm.shipmentId &&
    (!shippingAdmin.selectedShipment || shippingAdmin.statusActionOptions.includes('cancelled'))
  const statusOptions = shippingAdmin.hasStatusActionOptions
    ? shippingAdmin.statusActionOptions
    : [shippingAdmin.statusForm.status]

  return (
    <form className="orders-form" onSubmit={shippingAdmin.updateStatus}>
      <div className="orders-form-grid">
        <ShippingField
          label="Envio"
          name="shipmentId"
          onChange={shippingAdmin.handleStatusFormChange}
          placeholder="UUID del envio"
          value={shippingAdmin.statusForm.shipmentId}
        />
        <label className="orders-field">
          <span>Nuevo estado</span>
          <select
            disabled={!shippingAdmin.hasStatusActionOptions}
            name="status"
            onChange={shippingAdmin.handleStatusFormChange}
            value={shippingAdmin.statusForm.status}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <ShippingField
          label="Ubicacion"
          name="location"
          onChange={shippingAdmin.handleStatusFormChange}
          placeholder="Centro de distribucion"
          value={shippingAdmin.statusForm.location}
        />
        <ShippingField
          label="Fecha del evento"
          name="occurredAt"
          onChange={shippingAdmin.handleStatusFormChange}
          type="datetime-local"
          value={shippingAdmin.statusForm.occurredAt}
        />
        <label className="orders-field orders-field-wide">
          <span>Descripcion</span>
          <textarea
            name="description"
            onChange={shippingAdmin.handleStatusFormChange}
            placeholder="Detalle del evento de tracking"
            rows="3"
            value={shippingAdmin.statusForm.description}
          ></textarea>
        </label>
      </div>

      {!shippingAdmin.hasStatusActionOptions ? (
        <p className="orders-empty-note">Este envio esta en un estado terminal.</p>
      ) : null}

      <div className="orders-actions">
        <button
          className="orders-primary-button"
          disabled={
            shippingAdmin.isSaving ||
            !shippingAdmin.hasStatusActionOptions ||
            !shippingAdmin.statusForm.shipmentId
          }
          type="submit"
        >
          Actualizar estado
        </button>
        <button
          className="orders-danger-button"
          disabled={shippingAdmin.isSaving || !canCancel}
          onClick={shippingAdmin.cancelSelectedShipment}
          type="button"
        >
          Cancelar envio
        </button>
      </div>
    </form>
  )
}

function ShipmentEventsPanel({ shippingAdmin }) {
  if (!shippingAdmin.selectedShipment) {
    return <p className="orders-empty-note">Selecciona un envio para revisar su historial.</p>
  }

  return (
    <div className="orders-panel">
      <div className="orders-panel-heading">
        <div>
          <h3>Eventos del envio</h3>
          <p>{shippingAdmin.shipmentEvents.length} eventos registrados</p>
        </div>
        <button
          className="orders-ghost-button"
          disabled={shippingAdmin.isLoadingEvents}
          onClick={() => shippingAdmin.loadShipmentEvents(shippingAdmin.selectedShipment.id)}
          type="button"
        >
          {shippingAdmin.isLoadingEvents ? 'Cargando...' : 'Recargar eventos'}
        </button>
      </div>

      <div className="orders-table-wrap">
        <table className="orders-table order-items-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Ubicacion</th>
              <th>Descripcion</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {shippingAdmin.shipmentEvents.length > 0 ? (
              shippingAdmin.shipmentEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <StatusBadge status={event.status} />
                  </td>
                  <td>{formatOptional(event.location)}</td>
                  <td>{formatOptional(event.description)}</td>
                  <td>{formatDate(event.occurredAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">
                  {shippingAdmin.isLoadingEvents
                    ? 'Cargando eventos...'
                    : 'Sin eventos para mostrar.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ShipmentsTable({ emptyMessage, onSelect, shipments }) {
  return (
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Envio</th>
            <th>Pedido</th>
            <th>Estado</th>
            <th>Transportista</th>
            <th>Tracking</th>
            <th>Creado</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {shipments.length > 0 ? (
            shipments.map((shipment) => (
              <tr key={shipment.id}>
                <td>{shortId(shipment.id)}</td>
                <td>{shortId(shipment.orderId)}</td>
                <td>
                  <StatusBadge status={shipment.status} />
                </td>
                <td>{formatOptional(shipment.carrier)}</td>
                <td>{formatOptional(shipment.trackingNumber)}</td>
                <td>{formatDate(shipment.createdAt)}</td>
                <td>
                  <button
                    className="orders-table-action"
                    onClick={() => onSelect(shipment)}
                    type="button"
                  >
                    Operar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function DispatchOrdersTable({ emptyMessage, isSaving, onCreateShipment, orders }) {
  return (
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Estado pedido</th>
            <th>Items</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{shortId(order.id)}</td>
                <td>{shortId(order.customerId)}</td>
                <td>
                  <span className={`order-status-badge order-status-${order.status}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                </td>
                <td>{order.items?.length || 0}</td>
                <td>{formatMoney(order.totalAmount)}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <button
                    className="orders-table-action"
                    disabled={isSaving}
                    onClick={() => onCreateShipment(order)}
                    type="button"
                  >
                    Crear envio
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function ShipmentDetail({ shipment }) {
  return (
    <div className="order-detail">
      <div className="order-detail-grid">
        <DetailItem label="Envio" value={shipment.id} />
        <DetailItem label="Pedido" value={shipment.orderId} />
        <DetailItem label="Estado" value={statusLabel(shipment.status)} />
        <DetailItem label="Transportista" value={formatOptional(shipment.carrier)} />
        <DetailItem label="Tracking" value={formatOptional(shipment.trackingNumber)} />
        <DetailItem label="Creado" value={formatDate(shipment.createdAt)} />
        <DetailItem label="Enviado" value={formatDate(shipment.shippedAt)} />
        <DetailItem label="Entregado" value={formatDate(shipment.deliveredAt)} />
        <DetailItem label="Actualizado" value={formatDate(shipment.updatedAt)} />
      </div>
      <div className="order-address">
        <span>Direccion</span>
        <strong>{formatOptional(shipment.shippingAddress)}</strong>
      </div>
    </div>
  )
}

function ShippingField({
  label,
  name,
  onChange,
  placeholder,
  type = 'text',
  value,
}) {
  return (
    <label className="orders-field">
      <span>{label}</span>
      <input
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`order-status-badge order-status-${String(status || '').toUpperCase()}`}>
      {statusLabel(status)}
    </span>
  )
}

function Pagination({ canGoBack, canGoNext, currentPage, onNext, onPrevious, totalPages }) {
  return (
    <div className="orders-pagination">
      <span>
        Pagina {totalPages === 0 ? 0 : currentPage + 1} de {totalPages}
      </span>
      <div>
        <button
          className="orders-ghost-button"
          disabled={!canGoBack}
          onClick={onPrevious}
          type="button"
        >
          Anterior
        </button>
        <button
          className="orders-ghost-button"
          disabled={!canGoNext}
          onClick={onNext}
          type="button"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

function statusLabel(status) {
  const labels = {
    cancelled: 'Cancelado',
    delivered: 'Entregado',
    failed: 'Fallido',
    in_transit: 'En ruta',
    pending: 'Pendiente',
    ready_to_ship: 'Listo para despacho',
    returned: 'Devuelto',
  }

  return labels[status] || status || 'No informado'
}

function orderStatusLabel(status) {
  const labels = {
    CONFIRMED: 'Confirmado',
    SHIPPED: 'Enviado',
  }

  return labels[status] || status || 'No informado'
}

function shortId(id) {
  return String(id || '').slice(0, 8)
}

function formatDate(value) {
  if (!value) {
    return 'No informado'
  }

  return new Date(value).toLocaleString('es-CL')
}

function formatOptional(value) {
  return value || 'No informado'
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('es-CL', {
    currency: 'CLP',
    style: 'currency',
  })
}

export default ShippingSection
