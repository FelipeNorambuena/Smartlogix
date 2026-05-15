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
    operations: false,
    products: false,
    stock: false,
  })

  function toggleSection(sectionId) {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [sectionId]: !currentSections[sectionId],
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
          meta={`${inventory.totalElements} registros`}
          onToggle={toggleSection}
          title="Stock registrado"
        >
          <InventoryList inventory={inventory} />
        </CollapsibleInventorySection>

        <CollapsibleInventorySection
          id="create"
          isOpen={openSections.create}
          meta={inventory.nextSku || 'SKU automatico'}
          onToggle={toggleSection}
          title="Nuevo producto"
        >
          <InventoryCreateForm inventory={inventory} />
        </CollapsibleInventorySection>

        <CollapsibleInventorySection
          id="operations"
          isOpen={openSections.operations}
          meta={inventory.operationForm.productId || 'Selecciona un producto'}
          onToggle={toggleSection}
          title="Ajuste de stock"
        >
          <InventoryOperationsPanel inventory={inventory} />
        </CollapsibleInventorySection>

        <CollapsibleInventorySection
          id="products"
          isOpen={openSections.products}
          meta={`${inventory.productTotalElements} productos activos`}
          onToggle={toggleSection}
          title="Catalogo de productos"
        >
          <ProductAdminPanel inventory={inventory} />
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

function InventoryList({ inventory }) {
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
                  onSelect={inventory.selectInventoryForStock}
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
  return (
    <div className="inventory-card">
      <div className="inventory-card-heading">
        <h3>Ajuste de stock</h3>
        <p>{inventory.operationForm.productId || 'Sin producto seleccionado'}</p>
      </div>

      <InventoryField
        label="ID producto"
        name="productId"
        onChange={inventory.handleOperationChange}
        placeholder="UUID del producto"
        value={inventory.operationForm.productId}
      />

      <div className="endpoint-actions compact-actions">
        <button className="inventory-ghost-button" onClick={inventory.handleInventoryDetail} type="button">
          Inventario
        </button>
        <button className="inventory-ghost-button" onClick={inventory.handleStockDetail} type="button">
          Stock
        </button>
      </div>

      <form className="inventory-form compact-form" onSubmit={inventory.handleInventoryUpdate}>
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
        <button className="inventory-primary-button" disabled={inventory.isSaving} type="submit">
          Guardar stock
        </button>
      </form>

      <div className="stock-operation-row">
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
            Reservar
          </button>
          <button className="inventory-ghost-button" onClick={inventory.handleReleaseStock} type="button">
            Liberar
          </button>
          <button className="inventory-ghost-button" onClick={inventory.handleConfirmStock} type="button">
            Confirmar
          </button>
        </div>
      </div>

      <div className="stock-operation-row">
        <InventoryField
          label="Disponibilidad"
          min="1"
          name="availabilityQuantity"
          onChange={inventory.handleOperationChange}
          type="number"
          value={inventory.operationForm.availabilityQuantity}
        />
        <button className="inventory-ghost-button" onClick={inventory.handleAvailabilityCheck} type="button">
          Consultar
        </button>
      </div>

      {inventory.operationResult ? (
        <OperationResult result={inventory.operationResult} />
      ) : null}
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
        {'stockAvailable' in data ? <ResultItem label="Disponible" value={data.stockAvailable} /> : null}
        {'stockReserved' in data ? <ResultItem label="Reservado" value={data.stockReserved} /> : null}
        {'stockFree' in data ? <ResultItem label="Libre" value={data.stockFree} /> : null}
        {'available' in data ? <ResultItem label="Disponible" value={data.available ? 'Si' : 'No'} /> : null}
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

export default InventorySection
