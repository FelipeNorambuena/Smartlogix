import { useState } from 'react'
import { useInventoryAdmin } from '../hooks/useInventoryAdmin'
import '../styles/inventory-section.css'

/*
 * Seccion administrativa de inventario.
 * Consume exclusivamente rutas del API Gateway y nunca llama al microservicio directo.
 */
function InventorySection({ session }) {
  const inventory = useInventoryAdmin(session)
  const [openSections, setOpenSections] = useState({
    create: false,
    operations: true,
    products: false,
    stock: true,
  })

  function toggleSection(sectionId) {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [sectionId]: !currentSections[sectionId],
    }))
  }

  function handleSelectInventoryForStock(item) {
    inventory.selectInventoryForStock(item)
    setOpenSections((currentSections) => ({
      ...currentSections,
      operations: true,
    }))
  }

  return (
    <section className="inventory-section" aria-label="Inventario">
      <div className="inventory-header">
        <div>
          <p className="inventory-kicker">Inventario</p>
          <h2>Productos y stock</h2>
        </div>
        <div className="inventory-header-actions">
          <button
            className="inventory-ghost-button"
            disabled={inventory.isLoading}
            onClick={inventory.loadDashboard}
            type="button"
          >
            {inventory.isLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            className="inventory-ghost-button"
            disabled={inventory.isLoading}
            onClick={inventory.loadNextSku}
            type="button"
          >
            Siguiente SKU
          </button>
        </div>
      </div>

      <InventoryMessages inventory={inventory} />
      <InventoryUsageNotice />

      <div className="inventory-summary" aria-label="Resumen de inventario">
        <SummaryItem label="Productos activos" value={inventory.productTotalElements} />
        <SummaryItem label="Registros de stock" value={inventory.totalElements} />
        <SummaryItem label="Stock libre" value={inventory.summary.stockFree} />
        <SummaryItem label="Reservado" value={inventory.summary.reserved} />
        <SummaryItem label="Bajo reposicion" value={inventory.summary.lowStock} />
      </div>

      <div className="inventory-accordion">
        <CollapsibleInventorySection
          id="stock"
          isOpen={openSections.stock}
          onToggle={toggleSection}
          title="1. Revisar stock"
        >
          <InventoryList inventory={inventory} onSelectInventory={handleSelectInventoryForStock} />
        </CollapsibleInventorySection>

        <CollapsibleInventorySection
          id="operations"
          isOpen={openSections.operations}
          meta={inventory.operationForm.productId ? 'Producto seleccionado' : 'Selecciona desde la tabla'}
          onToggle={toggleSection}
          title="2. Operar stock"
        >
          <InventoryOperationsPanel inventory={inventory} />
        </CollapsibleInventorySection>

        <CollapsibleInventorySection
          id="products"
          isOpen={openSections.products}
          onToggle={toggleSection}
          title="3. Catalogo de productos"
        >
          <ProductAdminPanel inventory={inventory} />
        </CollapsibleInventorySection>

        <CollapsibleInventorySection
          id="create"
          isOpen={openSections.create}
          onToggle={toggleSection}
          title="4. Nuevo producto"
        >
          <InventoryCreateForm inventory={inventory} />
        </CollapsibleInventorySection>
      </div>
    </section>
  )
}

function CollapsibleInventorySection({ children, id, isOpen, meta, onToggle, title }) {
  const contentId = `inventory-section-${id}`

  return (
    <article className="inventory-disclosure">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="inventory-disclosure-button"
        onClick={() => onToggle(id)}
        type="button"
      >
        <span className="inventory-disclosure-main">
          <span className="inventory-disclosure-title">{title}</span>
          {meta ? <span className="inventory-disclosure-meta">{meta}</span> : null}
        </span>
        <span className="inventory-disclosure-icon" aria-hidden="true">
          {isOpen ? '-' : '+'}
        </span>
      </button>

      {isOpen ? (
        <div className="inventory-disclosure-content" id={contentId}>
          {children}
        </div>
      ) : null}
    </article>
  )
}

function InventoryMessages({ inventory }) {
  return (
    <>
      {inventory.errorMessage ? (
        <p className="inventory-error" role="alert">
          {inventory.errorMessage}
        </p>
      ) : null}

      {inventory.successMessage ? (
        <p className="inventory-success" role="status">
          {inventory.successMessage}
        </p>
      ) : null}
    </>
  )
}

function InventoryUsageNotice() {
  return (
    <div className="inventory-usage-note" role="note">
      <strong>Uso recomendado</strong>
      <span>
        Busca el producto en stock registrado, presiona Operar y luego aplica conteo,
        reserva, liberacion, confirmacion o consulta de disponibilidad.
      </span>
    </div>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div className="inventory-summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function InventoryCreateForm({ inventory }) {
  return (
    <form className="inventory-card inventory-form" onSubmit={inventory.handleCreateProduct}>
      <div className="inventory-card-heading inventory-card-heading-row">
        <div>
          <h3>Nuevo producto</h3>
          <p>{inventory.nextSku || 'SKU pendiente'}</p>
        </div>
        <button
          className="inventory-ghost-button"
          onClick={inventory.loadNextSku}
          type="button"
        >
          Ver SKU
        </button>
      </div>

      <div className="inventory-form-grid">
        <InventoryField
          label="Nombre"
          name="name"
          onChange={inventory.handleProductChange}
          placeholder="Producto"
          value={inventory.productForm.name}
        />
        <InventoryField
          label="Precio"
          min="0"
          name="unitPrice"
          onChange={inventory.handleProductChange}
          placeholder="0"
          step="0.01"
          type="number"
          value={inventory.productForm.unitPrice}
        />
        <InventoryField
          label="Categoria"
          name="category"
          onChange={inventory.handleProductChange}
          placeholder="Electronica"
          value={inventory.productForm.category}
        />
        <InventoryField
          label="Bodega"
          name="warehouseLocation"
          onChange={inventory.handleProductChange}
          placeholder="Bodega central"
          value={inventory.productForm.warehouseLocation}
        />
        <InventoryField
          label="Disponible"
          min="0"
          name="stockAvailable"
          onChange={inventory.handleProductChange}
          placeholder="0"
          type="number"
          value={inventory.productForm.stockAvailable}
        />
        <InventoryField
          label="Reservado"
          min="0"
          name="stockReserved"
          onChange={inventory.handleProductChange}
          type="number"
          value={inventory.productForm.stockReserved}
        />
        <InventoryField
          label="Reposicion"
          min="0"
          name="reorderPoint"
          onChange={inventory.handleProductChange}
          type="number"
          value={inventory.productForm.reorderPoint}
        />
      </div>

      <label className="inventory-field inventory-field-wide">
        <span>Descripcion</span>
        <textarea
          name="description"
          onChange={inventory.handleProductChange}
          placeholder="Detalle interno del producto"
          rows="3"
          value={inventory.productForm.description}
        ></textarea>
      </label>

      <button className="inventory-primary-button" disabled={inventory.isSaving} type="submit">
        {inventory.isSaving ? 'Guardando...' : 'Crear producto'}
      </button>
    </form>
  )
}

function InventoryField({
  label,
  min,
  name,
  onChange,
  placeholder,
  step,
  type = 'text',
  value,
}) {
  return (
    <label className="inventory-field">
      <span>{label}</span>
      <input
        min={min}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        type={type}
        value={value}
      />
    </label>
  )
}

function InventoryList({ inventory, onSelectInventory }) {
  const canGoBack = inventory.page > 0
  const canGoNext = inventory.totalPages > 0 && inventory.page + 1 < inventory.totalPages

  return (
    <div className="inventory-card inventory-list">
      <div className="inventory-card-heading inventory-card-heading-row">
        <div>
          <h3>Stock registrado</h3>
          <p>{inventory.totalElements} registros</p>
        </div>
        <button
          className="inventory-ghost-button"
          disabled={inventory.isLoading}
          onClick={() => inventory.loadInventory()}
          type="button"
        >
          Recargar stock
        </button>
      </div>

      <form className="inventory-filters" onSubmit={inventory.applyInventoryFilters}>
        <input
          name="sku"
          onChange={inventory.handleInventoryFilterChange}
          placeholder="SKU"
          value={inventory.inventoryFilters.sku}
        />
        <input
          name="warehouseLocation"
          onChange={inventory.handleInventoryFilterChange}
          placeholder="Bodega"
          value={inventory.inventoryFilters.warehouseLocation}
        />
        <select
          name="lowStock"
          onChange={inventory.handleInventoryFilterChange}
          value={inventory.inventoryFilters.lowStock}
        >
          <option value="">Todo stock</option>
          <option value="true">Bajo stock</option>
          <option value="false">Stock normal</option>
        </select>
        <button className="inventory-ghost-button" type="submit">
          Filtrar
        </button>
        <button
          className="inventory-ghost-button"
          onClick={inventory.clearInventoryFilters}
          type="button"
        >
          Limpiar
        </button>
      </form>

      <div className="inventory-table-wrap">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Disponible</th>
              <th>Reservado</th>
              <th>Libre</th>
              <th>Bodega</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {inventory.inventoryItems.length > 0 ? (
              inventory.inventoryItems.map((item) => (
                  <InventoryRow
                    item={item}
                    key={item.id || item.productId}
                    onSelect={onSelectInventory}
                  />
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  {inventory.isLoading ? 'Cargando inventario...' : 'Sin stock registrado.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={inventory.page}
        onNext={() => inventory.goToPage(inventory.page + 1)}
        onPrevious={() => inventory.goToPage(inventory.page - 1)}
        totalPages={inventory.totalPages}
      />
    </div>
  )
}

function ProductAdminPanel({ inventory }) {
  const canGoBack = inventory.productPage > 0
  const canGoNext =
    inventory.productTotalPages > 0 &&
    inventory.productPage + 1 < inventory.productTotalPages

  return (
    <div className="inventory-card inventory-list">
      <div className="inventory-card-heading inventory-card-heading-row">
        <div>
          <h3>Catalogo de productos</h3>
          <p>{inventory.productTotalElements} productos activos</p>
        </div>
        <button
          className="inventory-ghost-button"
          disabled={inventory.isLoading}
          onClick={() => inventory.loadProducts()}
          type="button"
        >
          Recargar productos
        </button>
      </div>

      <form className="inventory-filters product-filters" onSubmit={inventory.applyProductFilters}>
        <input
          name="sku"
          onChange={inventory.handleProductFilterChange}
          placeholder="SKU"
          value={inventory.productFilters.sku}
        />
        <input
          name="name"
          onChange={inventory.handleProductFilterChange}
          placeholder="Nombre"
          value={inventory.productFilters.name}
        />
        <input
          name="category"
          onChange={inventory.handleProductFilterChange}
          placeholder="Categoria"
          value={inventory.productFilters.category}
        />
        <button className="inventory-ghost-button" type="submit">
          Buscar
        </button>
        <button
          className="inventory-ghost-button"
          onClick={inventory.clearProductFilters}
          type="button"
        >
          Limpiar
        </button>
      </form>

      <div className="inventory-product-layout">
        <div className="inventory-table-wrap">
          <table className="inventory-table product-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {inventory.productItems.length > 0 ? (
                inventory.productItems.map((product) => (
                  <ProductRow
                    key={product.id}
                    onSelect={inventory.selectProductForEdit}
                    product={product}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    {inventory.isLoading ? 'Cargando productos...' : 'Sin productos para mostrar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ProductEditor inventory={inventory} />
      </div>

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={inventory.productPage}
        onNext={() => inventory.goToProductPage(inventory.productPage + 1)}
        onPrevious={() => inventory.goToProductPage(inventory.productPage - 1)}
        totalPages={inventory.productTotalPages}
      />
    </div>
  )
}

function ProductEditor({ inventory }) {
  return (
    <div className="endpoint-panel product-editor-panel">
      <h4>{inventory.selectedProduct ? 'Editar producto' : 'Seleccionar producto'}</h4>
      <div className="endpoint-actions endpoint-actions-grid">
        <input
          name="productId"
          onChange={inventory.handleLookupChange}
          placeholder="ID producto"
          value={inventory.productLookup.productId}
        />
        <button className="inventory-ghost-button" onClick={inventory.searchProductById} type="button">
          Buscar ID
        </button>
        <input
          name="sku"
          onChange={inventory.handleLookupChange}
          placeholder="SKU"
          value={inventory.productLookup.sku}
        />
        <button className="inventory-ghost-button" onClick={inventory.searchProductBySku} type="button">
          Buscar SKU
        </button>
      </div>

      {inventory.selectedProduct ? (
        <form className="inventory-form" onSubmit={inventory.handleUpdateProduct}>
          <div className="inventory-form-grid single-column-form">
            <InventoryField
              label="SKU"
              name="sku"
              onChange={inventory.handleEditProductChange}
              value={inventory.editProductForm.sku}
            />
            <InventoryField
              label="Nombre"
              name="name"
              onChange={inventory.handleEditProductChange}
              value={inventory.editProductForm.name}
            />
            <InventoryField
              label="Precio"
              min="0"
              name="unitPrice"
              onChange={inventory.handleEditProductChange}
              step="0.01"
              type="number"
              value={inventory.editProductForm.unitPrice}
            />
            <InventoryField
              label="Categoria"
              name="category"
              onChange={inventory.handleEditProductChange}
              value={inventory.editProductForm.category}
            />
          </div>
          <label className="inventory-field inventory-field-wide">
            <span>Descripcion</span>
            <textarea
              name="description"
              onChange={inventory.handleEditProductChange}
              rows="3"
              value={inventory.editProductForm.description}
            ></textarea>
          </label>
          <label className="inventory-check-row">
            <input
              checked={inventory.editProductForm.active}
              name="active"
              onChange={inventory.handleEditProductChange}
              type="checkbox"
            />
            <span>Producto activo</span>
          </label>
          <div className="endpoint-actions">
            <button className="inventory-primary-button" disabled={inventory.isSaving} type="submit">
              Actualizar
            </button>
            <button
              className="inventory-danger-button"
              disabled={inventory.isSaving}
              onClick={inventory.handleDeleteProduct}
              type="button"
            >
              Desactivar
            </button>
          </div>
        </form>
      ) : (
        <p className="inventory-empty-note">Elige un producto desde la tabla o busca por ID/SKU.</p>
      )}
    </div>
  )
}

function InventoryOperationsPanel({ inventory }) {
  const selectedLabel = getOperationProductLabel(inventory)

  return (
    <div className="inventory-card stock-workflow-card">
      <div className="inventory-card-heading inventory-card-heading-row">
        <div>
          <h3>Operar stock</h3>
          <p>{selectedLabel}</p>
        </div>
      </div>

      <div className="stock-workflow-grid">
        <section className="stock-workflow-panel">
          <WorkflowStepHeading
            number="1"
            text="Selecciona desde la tabla o pega el UUID si necesitas operar manualmente."
            title="Producto"
          />
          <InventoryField
            label="ID producto"
            name="productId"
            onChange={inventory.handleOperationChange}
            placeholder="UUID del producto"
            value={inventory.operationForm.productId}
          />
          <StockSnapshot inventory={inventory} />
        </section>

        <form
          className="stock-workflow-panel inventory-form"
          onSubmit={inventory.handleInventoryUpdate}
        >
          <WorkflowStepHeading
            number="2"
            text="Carga el inventario actual, revisa stock libre o guarda un nuevo conteo."
            title="Conteo"
          />
          <div className="inventory-form-grid">
            <InventoryField
              label="Disponible"
              min="0"
              name="stockAvailable"
              onChange={inventory.handleOperationChange}
              type="number"
              value={inventory.operationForm.stockAvailable}
            />
            <InventoryField
              label="Reservado"
              min="0"
              name="stockReserved"
              onChange={inventory.handleOperationChange}
              type="number"
              value={inventory.operationForm.stockReserved}
            />
            <InventoryField
              label="Bodega"
              name="warehouseLocation"
              onChange={inventory.handleOperationChange}
              value={inventory.operationForm.warehouseLocation}
            />
            <InventoryField
              label="Reposicion"
              min="0"
              name="reorderPoint"
              onChange={inventory.handleOperationChange}
              type="number"
              value={inventory.operationForm.reorderPoint}
            />
          </div>
          <div className="stock-count-actions">
            <button className="inventory-ghost-button" onClick={inventory.handleInventoryDetail} type="button">
              Cargar inventario
            </button>
            <button className="inventory-ghost-button" onClick={inventory.handleStockDetail} type="button">
              Ver stock libre
            </button>
            <button className="inventory-primary-button" disabled={inventory.isSaving} type="submit">
              Guardar conteo
            </button>
          </div>
        </form>

        <section className="stock-workflow-panel">
          <WorkflowStepHeading
            number="3"
            text="Usa estos movimientos cuando hay pedidos o cancelaciones."
            title="Movimiento"
          />
          <InventoryField
            label="Cantidad"
            min="1"
            name="quantity"
            onChange={inventory.handleOperationChange}
            type="number"
            value={inventory.operationForm.quantity}
          />
          <div className="endpoint-actions stock-actions">
            <button className="inventory-ghost-button" onClick={inventory.handleReserveStock} type="button">
              Reservar unidades
            </button>
            <button className="inventory-ghost-button" onClick={inventory.handleReleaseStock} type="button">
              Liberar reserva
            </button>
            <button className="inventory-ghost-button" onClick={inventory.handleConfirmStock} type="button">
              Confirmar salida
            </button>
          </div>
        </section>

        <section className="stock-workflow-panel">
          <WorkflowStepHeading
            number="4"
            text="Valida si hay unidades libres antes de comprometer un pedido."
            title="Disponibilidad"
          />
          <div className="stock-availability-row">
            <InventoryField
              label="Cantidad a validar"
              min="1"
              name="availabilityQuantity"
              onChange={inventory.handleOperationChange}
              type="number"
              value={inventory.operationForm.availabilityQuantity}
            />
            <button className="inventory-ghost-button" onClick={inventory.handleAvailabilityCheck} type="button">
              Consultar disponibilidad
            </button>
          </div>
        </section>
      </div>

      {shouldShowOperationResult(inventory.operationResult) ? (
        <OperationResult result={inventory.operationResult} />
      ) : null}
    </div>
  )
}

function WorkflowStepHeading({ number, text, title }) {
  return (
    <div className="workflow-step-heading">
      <span aria-hidden="true">{number}</span>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  )
}

function StockSnapshot({ inventory }) {
  const stockFree = calculateOperationStockFree(inventory.operationForm)

  if (!inventory.operationForm.productId) {
    return (
      <p className="inventory-empty-note">
        Aun no hay producto seleccionado para operar stock.
      </p>
    )
  }

  return (
    <div className="stock-snapshot" aria-label="Producto seleccionado">
      <ResultItem label="Disponible" value={inventory.operationForm.stockAvailable || '-'} />
      <ResultItem label="Reservado" value={inventory.operationForm.stockReserved || '0'} />
      <ResultItem label="Libre" value={stockFree} />
      <ResultItem label="Bodega" value={inventory.operationForm.warehouseLocation || '-'} />
    </div>
  )
}

function ProductRow({ onSelect, product }) {
  return (
    <tr>
      <td>{product.sku}</td>
      <td>{product.name}</td>
      <td>{product.category || 'Sin categoria'}</td>
      <td>{formatMoney(product.unitPrice)}</td>
      <td>
        <span className={product.active ? 'state-badge state-badge-ok' : 'state-badge'}>
          {product.active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td>
        <button className="inventory-table-action" onClick={() => onSelect(product)} type="button">
          Editar
        </button>
      </td>
    </tr>
  )
}

function InventoryRow({ item, onSelect }) {
  const stockFree = item.stockAvailable - item.stockReserved
  const isLowStock = item.stockAvailable <= item.reorderPoint

  return (
    <tr>
      <td>{item.sku}</td>
      <td>{item.productName}</td>
      <td>
        <span className={isLowStock ? 'stock-badge stock-badge-warning' : 'stock-badge'}>
          {item.stockAvailable}
        </span>
      </td>
      <td>{item.stockReserved}</td>
      <td>{stockFree}</td>
      <td>{item.warehouseLocation || 'Sin bodega'}</td>
      <td>
        <button className="inventory-table-action" onClick={() => onSelect(item)} type="button">
          Operar
        </button>
      </td>
    </tr>
  )
}

function OperationResult({ result }) {
  const data = result.data || {}

  return (
    <div className="operation-result">
      <strong>{result.title}</strong>
      <div className="operation-result-grid">
        {'sku' in data ? <ResultItem label="SKU" value={data.sku} /> : null}
        {'productName' in data ? <ResultItem label="Producto" value={data.productName} /> : null}
        {'requestedQuantity' in data ? <ResultItem label="Solicitado" value={data.requestedQuantity} /> : null}
        {'stockAvailable' in data ? <ResultItem label="Disponible" value={data.stockAvailable} /> : null}
        {'stockReserved' in data ? <ResultItem label="Reservado" value={data.stockReserved} /> : null}
        {'stockFree' in data ? <ResultItem label="Libre" value={data.stockFree} /> : null}
        {'warehouseLocation' in data ? <ResultItem label="Bodega" value={data.warehouseLocation || '-'} /> : null}
        {'productActive' in data ? <ResultItem label="Producto activo" value={data.productActive ? 'Si' : 'No'} /> : null}
        {'available' in data ? <ResultItem label="Resultado" value={data.available ? 'Disponible' : 'Sin stock'} /> : null}
      </div>
    </div>
  )
}

function ResultItem({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{String(value ?? '-')}</strong>
    </div>
  )
}

function Pagination({ canGoBack, canGoNext, currentPage, onNext, onPrevious, totalPages }) {
  return (
    <div className="inventory-pagination">
      <span>
        Pagina {totalPages === 0 ? 0 : currentPage + 1} de {totalPages}
      </span>
      <div>
        <button
          className="inventory-ghost-button"
          disabled={!canGoBack}
          onClick={onPrevious}
          type="button"
        >
          Anterior
        </button>
        <button
          className="inventory-ghost-button"
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

function formatMoney(value) {
  return Number(value || 0).toLocaleString('es-CL', {
    currency: 'CLP',
    style: 'currency',
  })
}

function getOperationProductLabel(inventory) {
  const resultData = inventory.operationResult?.data || {}
  const product = inventory.selectedProduct

  if (resultData.sku || resultData.productName) {
    return [resultData.sku, resultData.productName].filter(Boolean).join(' - ')
  }

  if (product?.sku || product?.name) {
    return [product.sku, product.name].filter(Boolean).join(' - ')
  }

  if (inventory.operationForm.productId) {
    return `ID ${inventory.operationForm.productId}`
  }

  return 'Selecciona un producto en Stock registrado'
}

function calculateOperationStockFree(form) {
  const stockAvailable = Number(form.stockAvailable)
  const stockReserved = Number(form.stockReserved)

  if (!Number.isFinite(stockAvailable) || !Number.isFinite(stockReserved)) {
    return '-'
  }

  return stockAvailable - stockReserved
}

function shouldShowOperationResult(result) {
  if (!result) {
    return false
  }

  return ![
    'Inventario del producto',
    'Stock del producto',
  ].includes(result.title) && !result.title.startsWith('Stock ')
}

export default InventorySection
