import { useState } from 'react'
import { useOrdersAdmin } from '../hooks/useOrdersAdmin'
import '../styles/orders-section.css'

/*
 * Seccion administrativa de pedidos.
 * Consume rutas /orders desde API Gateway y mantiene la UI desacoplada del modelo JPA.
 */
function OrdersSection({ session }) {
  const ordersAdmin = useOrdersAdmin(session)
  const [openSections, setOpenSections] = useState({
    create: false,
    customer: false,
    detail: false,
    list: false,
    status: false,
  })

  function toggleSection(sectionId) {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [sectionId]: !currentSections[sectionId],
    }))
  }

  return (
    <section className="orders-section" aria-label="Pedidos">
      <div className="orders-header">
        <div>
          <p className="orders-kicker">Pedidos</p>
          <h2>Ordenes y estados</h2>
        </div>
        <button
          className="orders-ghost-button"
          disabled={ordersAdmin.isLoading}
          onClick={() => ordersAdmin.loadOrders()}
          type="button"
        >
          {ordersAdmin.isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <OrdersMessages ordersAdmin={ordersAdmin} />

      <div className="orders-summary" aria-label="Resumen de pedidos">
        <SummaryItem label="Pedidos" value={ordersAdmin.totalElements} />
        <SummaryItem label="Confirmados" value={ordersAdmin.summary.confirmed} />
        <SummaryItem label="Enviados" value={ordersAdmin.summary.shipped} />
        <SummaryItem label="Pendientes" value={ordersAdmin.summary.pending} />
        <SummaryItem label="Total pagina" value={formatMoney(ordersAdmin.summary.totalAmount)} />
      </div>

      <div className="orders-accordion">
        <CollapsibleOrdersSection
          id="list"
          isOpen={openSections.list}
          meta={`${ordersAdmin.totalElements} pedidos`}
          onToggle={toggleSection}
          title="Listado de pedidos"
        >
          <OrdersList ordersAdmin={ordersAdmin} />
        </CollapsibleOrdersSection>

        <CollapsibleOrdersSection
          id="create"
          isOpen={openSections.create}
          meta="SKU y cantidad"
          onToggle={toggleSection}
          title="Nuevo pedido"
        >
          <OrderCreateForm ordersAdmin={ordersAdmin} />
        </CollapsibleOrdersSection>

        <CollapsibleOrdersSection
          id="detail"
          isOpen={openSections.detail}
          meta={ordersAdmin.selectedOrder?.id || 'Buscar por ID'}
          onToggle={toggleSection}
          title="Detalle de pedido"
        >
          <OrderDetailPanel ordersAdmin={ordersAdmin} />
        </CollapsibleOrdersSection>

        <CollapsibleOrdersSection
          id="status"
          isOpen={openSections.status}
          meta={ordersAdmin.statusForm.orderId || 'Selecciona un pedido'}
          onToggle={toggleSection}
          title="Actualizar estado"
        >
          <OrderStatusPanel ordersAdmin={ordersAdmin} />
        </CollapsibleOrdersSection>

        <CollapsibleOrdersSection
          id="customer"
          isOpen={openSections.customer}
          meta={`${ordersAdmin.customerTotalElements} resultados`}
          onToggle={toggleSection}
          title="Pedidos por cliente"
        >
          <CustomerOrdersPanel ordersAdmin={ordersAdmin} />
        </CollapsibleOrdersSection>
      </div>
    </section>
  )
}

function CollapsibleOrdersSection({ children, id, isOpen, meta, onToggle, title }) {
  const contentId = `orders-section-${id}`

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

function OrdersMessages({ ordersAdmin }) {
  return (
    <>
      {ordersAdmin.errorMessage ? (
        <p className="orders-error" role="alert">
          {ordersAdmin.errorMessage}
        </p>
      ) : null}

      {ordersAdmin.successMessage ? (
        <p className="orders-success" role="status">
          {ordersAdmin.successMessage}
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

function OrdersList({ ordersAdmin }) {
  const canGoBack = ordersAdmin.page > 0
  const canGoNext = ordersAdmin.totalPages > 0 && ordersAdmin.page + 1 < ordersAdmin.totalPages

  return (
    <div className="orders-panel">
      <div className="orders-panel-heading">
        <div>
          <h3>Listado de pedidos</h3>
          <p>{ordersAdmin.totalElements} pedidos encontrados</p>
        </div>
        <button
          className="orders-ghost-button"
          disabled={ordersAdmin.isLoading}
          onClick={() => ordersAdmin.loadOrders()}
          type="button"
        >
          Recargar
        </button>
      </div>

      <form className="orders-filters" onSubmit={ordersAdmin.applyFilters}>
        <input
          name="customerId"
          onChange={ordersAdmin.handleFilterChange}
          placeholder="Cliente UUID"
          value={ordersAdmin.filters.customerId}
        />
        <select
          name="status"
          onChange={ordersAdmin.handleFilterChange}
          value={ordersAdmin.filters.status}
        >
          <option value="">Todos los estados</option>
          {ordersAdmin.statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
        <button className="orders-ghost-button" type="submit">
          Filtrar
        </button>
        <button className="orders-ghost-button" onClick={ordersAdmin.clearFilters} type="button">
          Limpiar
        </button>
      </form>

      <OrdersTable
        emptyMessage={ordersAdmin.isLoading ? 'Cargando pedidos...' : 'Sin pedidos para mostrar.'}
        onSelect={ordersAdmin.selectOrder}
        orders={ordersAdmin.orders}
      />

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={ordersAdmin.page}
        onNext={() => ordersAdmin.goToPage(ordersAdmin.page + 1)}
        onPrevious={() => ordersAdmin.goToPage(ordersAdmin.page - 1)}
        totalPages={ordersAdmin.totalPages}
      />
    </div>
  )
}

function OrderCreateForm({ ordersAdmin }) {
  return (
    <form className="orders-form" onSubmit={ordersAdmin.handleCreateOrder}>
      <label className="orders-field orders-field-wide">
        <span>Direccion de envio</span>
        <textarea
          name="shippingAddress"
          onChange={ordersAdmin.handleOrderFormChange}
          placeholder="Av. Providencia 1234, Santiago"
          rows="3"
          value={ordersAdmin.orderForm.shippingAddress}
        ></textarea>
      </label>

      <div className="orders-items">
        {ordersAdmin.orderForm.items.map((item, index) => (
          <div className="orders-item-row" key={`order-item-${index}`}>
            <label className="orders-field">
              <span>SKU</span>
              <input
                name="sku"
                onChange={(event) => ordersAdmin.handleOrderItemChange(index, event)}
                placeholder="SKU-000001"
                value={item.sku}
              />
            </label>
            <label className="orders-field">
              <span>Cantidad</span>
              <input
                min="1"
                name="quantity"
                onChange={(event) => ordersAdmin.handleOrderItemChange(index, event)}
                type="number"
                value={item.quantity}
              />
            </label>
            <button
              className="orders-ghost-button"
              disabled={ordersAdmin.orderForm.items.length === 1}
              onClick={() => ordersAdmin.removeOrderItem(index)}
              type="button"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="orders-actions">
        <button className="orders-ghost-button" onClick={ordersAdmin.addOrderItem} type="button">
          Agregar item
        </button>
        <button className="orders-primary-button" disabled={ordersAdmin.isSaving} type="submit">
          {ordersAdmin.isSaving ? 'Creando...' : 'Crear pedido'}
        </button>
      </div>
    </form>
  )
}

function OrderDetailPanel({ ordersAdmin }) {
  return (
    <div className="orders-panel">
      <div className="orders-lookup">
        <input
          name="orderId"
          onChange={ordersAdmin.handleLookupChange}
          placeholder="ID del pedido"
          value={ordersAdmin.lookup.orderId}
        />
        <button className="orders-ghost-button" onClick={ordersAdmin.searchOrderById} type="button">
          Buscar
        </button>
      </div>

      {ordersAdmin.selectedOrder ? (
        <OrderDetail order={ordersAdmin.selectedOrder} />
      ) : (
        <p className="orders-empty-note">Selecciona un pedido desde la tabla o busca por ID.</p>
      )}
    </div>
  )
}

function OrderStatusPanel({ ordersAdmin }) {
  return (
    <form className="orders-form" onSubmit={ordersAdmin.handleUpdateStatus}>
      <div className="orders-form-grid">
        <label className="orders-field">
          <span>ID pedido</span>
          <input
            name="orderId"
            onChange={ordersAdmin.handleStatusFormChange}
            placeholder="UUID del pedido"
            value={ordersAdmin.statusForm.orderId}
          />
        </label>
        <label className="orders-field">
          <span>Estado</span>
          <select
            name="status"
            onChange={ordersAdmin.handleStatusFormChange}
            value={ordersAdmin.statusForm.status}
          >
            {ordersAdmin.statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="orders-actions">
        <button className="orders-primary-button" disabled={ordersAdmin.isSaving} type="submit">
          Actualizar estado
        </button>
        <button
          className="orders-danger-button"
          disabled={ordersAdmin.isSaving}
          onClick={ordersAdmin.handleCancelOrder}
          type="button"
        >
          Cancelar pedido
        </button>
      </div>
    </form>
  )
}

function CustomerOrdersPanel({ ordersAdmin }) {
  const canGoBack = ordersAdmin.customerPage > 0
  const canGoNext =
    ordersAdmin.customerTotalPages > 0 &&
    ordersAdmin.customerPage + 1 < ordersAdmin.customerTotalPages

  return (
    <div className="orders-panel">
      <form className="orders-lookup" onSubmit={ordersAdmin.handleCustomerSearch}>
        <input
          name="customerId"
          onChange={ordersAdmin.handleLookupChange}
          placeholder="ID del cliente"
          value={ordersAdmin.lookup.customerId}
        />
        <button className="orders-ghost-button" type="submit">
          Buscar cliente
        </button>
      </form>

      <OrdersTable
        emptyMessage={
          ordersAdmin.isLoading ? 'Cargando pedidos...' : 'Sin pedidos para este cliente.'
        }
        onSelect={ordersAdmin.selectOrder}
        orders={ordersAdmin.customerOrders}
      />

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={ordersAdmin.customerPage}
        onNext={() => ordersAdmin.goToCustomerPage(ordersAdmin.customerPage + 1)}
        onPrevious={() => ordersAdmin.goToCustomerPage(ordersAdmin.customerPage - 1)}
        totalPages={ordersAdmin.customerTotalPages}
      />
    </div>
  )
}

function OrdersTable({ emptyMessage, onSelect, orders }) {
  return (
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Estado</th>
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
                    {statusLabel(order.status)}
                  </span>
                </td>
                <td>{order.items?.length || 0}</td>
                <td>{formatMoney(order.totalAmount)}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <button className="orders-table-action" onClick={() => onSelect(order)} type="button">
                    Seleccionar
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

function OrderDetail({ order }) {
  return (
    <div className="order-detail">
      <div className="order-detail-grid">
        <DetailItem label="Pedido" value={order.id} />
        <DetailItem label="Cliente" value={order.customerId} />
        <DetailItem label="Estado" value={statusLabel(order.status)} />
        <DetailItem label="Total" value={formatMoney(order.totalAmount)} />
        <DetailItem label="Creado" value={formatDate(order.createdAt)} />
        <DetailItem label="Actualizado" value={formatDate(order.updatedAt)} />
      </div>
      <div className="order-address">
        <span>Direccion</span>
        <strong>{order.shippingAddress}</strong>
      </div>

      <div className="orders-table-wrap">
        <table className="orders-table order-items-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Total linea</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{formatMoney(item.unitPrice)}</td>
                <td>{formatMoney(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
    CANCELLED: 'Cancelado',
    CONFIRMED: 'Confirmado',
    DELIVERED: 'Entregado',
    PAYMENT_FAILED: 'Pago fallido',
    PENDING: 'Pendiente',
    SHIPPED: 'Enviado',
  }

  return labels[status] || status
}

function shortId(id) {
  return String(id || '').slice(0, 8)
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('es-CL', {
    currency: 'CLP',
    style: 'currency',
  })
}

function formatDate(value) {
  if (!value) {
    return 'No informado'
  }

  return new Date(value).toLocaleString('es-CL')
}

export default OrdersSection
