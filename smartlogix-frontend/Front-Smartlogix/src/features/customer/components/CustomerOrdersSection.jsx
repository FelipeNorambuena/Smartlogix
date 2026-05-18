import { useState } from 'react'
import { useCustomerOrders } from '../hooks/useCustomerOrders'
import '../../orders/styles/orders-section.css'

const DEFAULT_OPEN_SECTIONS = {
  catalog: true,
  create: true,
  customer: false,
  detail: false,
  list: true,
}

/*
 * Seccion CLIENTE para pedidos propios.
 * No muestra acciones administrativas ni cambio manual de estados.
 */
function CustomerOrdersSection({ session }) {
  const customerOrders = useCustomerOrders(session)
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS)

  function toggleSection(sectionId) {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [sectionId]: !currentSections[sectionId],
    }))
  }

  function handleSelectOrder(order) {
    customerOrders.selectOrder(order)
    setOpenSections((currentSections) => ({
      ...currentSections,
      detail: true,
    }))
  }

  return (
    <section className="orders-section" aria-label="Pedidos del cliente">
      <div className="orders-header">
        <div>
          <p className="orders-kicker">Cliente</p>
          <h2>Mis pedidos</h2>
        </div>
        <button
          className="orders-ghost-button"
          disabled={customerOrders.isLoading}
          onClick={() => customerOrders.loadOrders()}
          type="button"
        >
          {customerOrders.isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <CustomerMessages customerOrders={customerOrders} />

      <div className="orders-summary" aria-label="Resumen de mis pedidos">
        <SummaryItem label="Pedidos" value={customerOrders.totalElements} />
        <SummaryItem label="Confirmados" value={customerOrders.summary.confirmed} />
        <SummaryItem label="Enviados" value={customerOrders.summary.shipped} />
        <SummaryItem label="Entregados" value={customerOrders.summary.delivered} />
        <SummaryItem label="Total pagina" value={formatMoney(customerOrders.summary.totalAmount)} />
      </div>

      <div className="orders-accordion">
        <CollapsibleCustomerSection
          id="catalog"
          isOpen={openSections.catalog}
          meta={`${customerOrders.productTotalElements} productos`}
          onToggle={toggleSection}
          title="Catalogo de productos"
        >
          <ProductCatalogPanel customerOrders={customerOrders} />
        </CollapsibleCustomerSection>

        <CollapsibleCustomerSection
          id="create"
          isOpen={openSections.create}
          meta="SKU y direccion"
          onToggle={toggleSection}
          title="Nuevo pedido"
        >
          <CustomerOrderCreateForm customerOrders={customerOrders} />
        </CollapsibleCustomerSection>

        <CollapsibleCustomerSection
          id="list"
          isOpen={openSections.list}
          meta={`${customerOrders.totalElements} pedidos`}
          onToggle={toggleSection}
          title="Mis pedidos"
        >
          <CustomerOrdersList
            customerOrders={customerOrders}
            onSelectOrder={handleSelectOrder}
          />
        </CollapsibleCustomerSection>

        <CollapsibleCustomerSection
          id="detail"
          isOpen={openSections.detail}
          meta={customerOrders.selectedOrder?.id || 'Buscar por ID'}
          onToggle={toggleSection}
          title="Detalle y cancelacion"
        >
          <CustomerOrderDetailPanel customerOrders={customerOrders} />
        </CollapsibleCustomerSection>

        <CollapsibleCustomerSection
          id="customer"
          isOpen={openSections.customer}
          meta={`${customerOrders.customerTotalElements} resultados`}
          onToggle={toggleSection}
          title="Endpoint por cliente"
        >
          <CustomerEndpointPanel
            customerOrders={customerOrders}
            onSelectOrder={handleSelectOrder}
          />
        </CollapsibleCustomerSection>
      </div>
    </section>
  )
}

function CollapsibleCustomerSection({ children, id, isOpen, meta, onToggle, title }) {
  const contentId = `customer-section-${id}`

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

function CustomerMessages({ customerOrders }) {
  return (
    <>
      {customerOrders.errorMessage ? (
        <p className="orders-error" role="alert">
          {customerOrders.errorMessage}
        </p>
      ) : null}

      {customerOrders.successMessage ? (
        <p className="orders-success" role="status">
          {customerOrders.successMessage}
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

function CustomerOrderCreateForm({ customerOrders }) {
  return (
    <form className="orders-form" onSubmit={customerOrders.handleCreateOrder}>
      <label className="orders-field orders-field-wide">
        <span>Direccion de envio</span>
        <textarea
          name="shippingAddress"
          onChange={customerOrders.handleOrderFormChange}
          placeholder="Av. Providencia 1234, Santiago"
          rows="3"
          value={customerOrders.orderForm.shippingAddress}
        ></textarea>
      </label>

      <div className="orders-items">
        {customerOrders.orderForm.items.map((item, index) => (
          <div className="customer-order-item-row" key={`customer-order-item-${index}`}>
            <label className="orders-field">
              <span>SKU</span>
              <input
                name="sku"
                onChange={(event) => customerOrders.handleOrderItemChange(index, event)}
                placeholder="SKU-000001"
                value={item.sku}
              />
            </label>
            <div className="customer-product-summary">
              <span>Producto</span>
              <strong>{item.productName || 'Selecciona desde catalogo'}</strong>
            </div>
            <div className="customer-product-summary">
              <span>Precio unidad</span>
              <strong>{item.unitPrice ? formatMoney(item.unitPrice) : 'No informado'}</strong>
            </div>
            <label className="orders-field">
              <span>Cantidad</span>
              <input
                min="1"
                name="quantity"
                onChange={(event) => customerOrders.handleOrderItemChange(index, event)}
                type="number"
                value={item.quantity}
              />
            </label>
            <div className="customer-product-summary">
              <span>Total linea</span>
              <strong>{formatMoney(calculateLineTotal(item))}</strong>
            </div>
            <button
              className="orders-ghost-button"
              disabled={customerOrders.orderForm.items.length === 1}
              onClick={() => customerOrders.removeOrderItem(index)}
              type="button"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="customer-order-totals" aria-label="Resumen del nuevo pedido">
        <SummaryItem label="Articulos" value={customerOrders.orderDraftSummary.itemCount} />
        <SummaryItem label="Unidades" value={customerOrders.orderDraftSummary.totalQuantity} />
        <SummaryItem
          label="Total estimado"
          value={formatMoney(customerOrders.orderDraftSummary.totalAmount)}
        />
      </div>

      <div className="orders-actions">
        <button className="orders-ghost-button" onClick={customerOrders.addOrderItem} type="button">
          Agregar item
        </button>
        <button className="orders-primary-button" disabled={customerOrders.isSaving} type="submit">
          {customerOrders.isSaving ? 'Creando...' : 'Crear pedido'}
        </button>
      </div>
    </form>
  )
}

function ProductCatalogPanel({ customerOrders }) {
  const canGoBack = customerOrders.productPage > 0
  const canGoNext =
    customerOrders.productTotalPages > 0 &&
    customerOrders.productPage + 1 < customerOrders.productTotalPages

  return (
    <div className="orders-panel">
      <div className="orders-panel-heading">
        <div>
          <h3>Productos disponibles</h3>
          <p>{customerOrders.productTotalElements} productos activos</p>
        </div>
        <button
          className="orders-ghost-button"
          disabled={customerOrders.isLoadingProducts}
          onClick={() => customerOrders.loadProducts()}
          type="button"
        >
          {customerOrders.isLoadingProducts ? 'Cargando...' : 'Recargar'}
        </button>
      </div>

      <form
        className="orders-filters customer-products-filters"
        onSubmit={customerOrders.applyProductFilters}
      >
        <input
          name="sku"
          onChange={customerOrders.handleProductFilterChange}
          placeholder="SKU"
          value={customerOrders.productFilters.sku}
        />
        <input
          name="name"
          onChange={customerOrders.handleProductFilterChange}
          placeholder="Nombre"
          value={customerOrders.productFilters.name}
        />
        <input
          name="category"
          onChange={customerOrders.handleProductFilterChange}
          placeholder="Categoria"
          value={customerOrders.productFilters.category}
        />
        <button className="orders-ghost-button" type="submit">
          Buscar
        </button>
        <button
          className="orders-ghost-button"
          onClick={customerOrders.clearProductFilters}
          type="button"
        >
          Limpiar
        </button>
      </form>

      <ProductTable
        emptyMessage={
          customerOrders.isLoadingProducts
            ? 'Cargando productos...'
            : 'Sin productos para mostrar.'
        }
        onAddProduct={customerOrders.addProductToOrder}
        products={customerOrders.products}
      />

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={customerOrders.productPage}
        onNext={() => customerOrders.goToProductPage(customerOrders.productPage + 1)}
        onPrevious={() => customerOrders.goToProductPage(customerOrders.productPage - 1)}
        totalPages={customerOrders.productTotalPages}
      />
    </div>
  )
}

function CustomerOrdersList({ customerOrders, onSelectOrder }) {
  const canGoBack = customerOrders.page > 0
  const canGoNext =
    customerOrders.totalPages > 0 && customerOrders.page + 1 < customerOrders.totalPages

  return (
    <div className="orders-panel">
      <div className="orders-panel-heading">
        <div>
          <h3>Pedidos asociados a tu sesion</h3>
          <p>{customerOrders.totalElements} pedidos encontrados</p>
        </div>
        <button
          className="orders-ghost-button"
          disabled={customerOrders.isLoading}
          onClick={() => customerOrders.loadOrders()}
          type="button"
        >
          Recargar
        </button>
      </div>

      <form className="orders-filters customer-orders-filters" onSubmit={customerOrders.applyFilters}>
        <select
          name="status"
          onChange={customerOrders.handleFilterChange}
          value={customerOrders.filters.status}
        >
          <option value="">Todos los estados</option>
          {customerOrders.statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
        <button className="orders-ghost-button" type="submit">
          Filtrar
        </button>
        <button className="orders-ghost-button" onClick={customerOrders.clearFilters} type="button">
          Limpiar
        </button>
      </form>

      <CustomerOrdersTable
        emptyMessage={customerOrders.isLoading ? 'Cargando pedidos...' : 'Sin pedidos para mostrar.'}
        onSelect={onSelectOrder}
        orders={customerOrders.orders}
      />

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={customerOrders.page}
        onNext={() => customerOrders.goToPage(customerOrders.page + 1)}
        onPrevious={() => customerOrders.goToPage(customerOrders.page - 1)}
        totalPages={customerOrders.totalPages}
      />
    </div>
  )
}

function CustomerOrderDetailPanel({ customerOrders }) {
  return (
    <div className="orders-panel">
      <form className="orders-lookup" onSubmit={customerOrders.searchOrderById}>
        <input
          name="orderId"
          onChange={customerOrders.handleLookupChange}
          placeholder="ID del pedido"
          value={customerOrders.lookup.orderId}
        />
        <button className="orders-ghost-button" disabled={customerOrders.isLoading} type="submit">
          Buscar
        </button>
      </form>

      {customerOrders.selectedOrder ? (
        <>
          <OrderDetail order={customerOrders.selectedOrder} />
          <div className="orders-actions">
            <button
              className="orders-danger-button"
              disabled={customerOrders.isSaving || !customerOrders.canCancelSelectedOrder}
              onClick={customerOrders.handleCancelOrder}
              type="button"
            >
              Cancelar pedido
            </button>
          </div>
          {!customerOrders.canCancelSelectedOrder ? (
            <p className="orders-empty-note">
              Este pedido ya no permite cancelacion desde el rol cliente.
            </p>
          ) : null}
        </>
      ) : (
        <p className="orders-empty-note">
          Selecciona un pedido desde la tabla o busca por ID.
        </p>
      )}
    </div>
  )
}

function CustomerEndpointPanel({ customerOrders, onSelectOrder }) {
  const canGoBack = customerOrders.customerPage > 0
  const canGoNext =
    customerOrders.customerTotalPages > 0 &&
    customerOrders.customerPage + 1 < customerOrders.customerTotalPages

  return (
    <div className="orders-panel">
      <div className="orders-panel-heading">
        <div>
          <h3>Consulta /orders/customer/{shortId(customerOrders.customerId)}</h3>
          <p>{customerOrders.customerTotalElements} pedidos devueltos por tu ID de cliente</p>
        </div>
        <button
          className="orders-ghost-button"
          disabled={customerOrders.isLoading}
          onClick={() => customerOrders.loadOrdersByCurrentCustomer()}
          type="button"
        >
          Consultar
        </button>
      </div>

      <CustomerOrdersTable
        emptyMessage={customerOrders.isLoading ? 'Cargando pedidos...' : 'Sin resultados.'}
        onSelect={onSelectOrder}
        orders={customerOrders.customerOrders}
      />

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={customerOrders.customerPage}
        onNext={() => customerOrders.goToCustomerPage(customerOrders.customerPage + 1)}
        onPrevious={() => customerOrders.goToCustomerPage(customerOrders.customerPage - 1)}
        totalPages={customerOrders.customerTotalPages}
      />
    </div>
  )
}

function CustomerOrdersTable({ emptyMessage, onSelect, orders }) {
  return (
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Pedido</th>
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
                <td>
                  <span className={`order-status-badge order-status-${order.status}`}>
                    {statusLabel(order.status)}
                  </span>
                </td>
                <td>{order.items?.length || 0}</td>
                <td>{formatMoney(order.totalAmount)}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <button
                    className="orders-table-action"
                    onClick={() => onSelect(order)}
                    type="button"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function ProductTable({ emptyMessage, onAddProduct, products }) {
  return (
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Categoria</th>
            <th>Precio</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category || 'Sin categoria'}</td>
                <td>{formatMoney(product.unitPrice)}</td>
                <td>
                  <button
                    className="orders-table-action"
                    onClick={() => onAddProduct(product)}
                    type="button"
                  >
                    Agregar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">{emptyMessage}</td>
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

function calculateLineTotal(item) {
  const quantity = Number(item.quantity)
  const unitPrice = Number(item.unitPrice)

  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
    return 0
  }

  return quantity * unitPrice
}

function formatDate(value) {
  if (!value) {
    return 'No informado'
  }

  return new Date(value).toLocaleString('es-CL')
}

export default CustomerOrdersSection
