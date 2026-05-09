import { useInventoryAdmin } from '../hooks/useInventoryAdmin'
import '../styles/inventory-section.css'

/*
 * Seccion administrativa de inventario.
 * Consume exclusivamente rutas del API Gateway y nunca llama al microservicio directo.
 */
function InventorySection({ session }) {
  const inventory = useInventoryAdmin(session)

  return (
    <section className="inventory-section" aria-label="Inventario">
      <div className="inventory-header">
        <div>
          <p className="inventory-kicker">M&oacute;dulo administrativo</p>
          <h2>Inventario</h2>
        </div>
        <div className="inventory-header-actions">
          <button
            className="inventory-ghost-button"
            disabled={inventory.isLoading}
            onClick={inventory.loadProducts}
            type="button"
          >
            Productos
          </button>
          <button
            className="inventory-ghost-button"
            disabled={inventory.isLoading}
            onClick={inventory.loadInventory}
            type="button"
          >
            {inventory.isLoading ? 'Actualizando...' : 'Inventario'}
          </button>
        </div>
      </div>

      <InventoryMessages inventory={inventory} />

      <div className="inventory-summary" aria-label="Resumen de inventario">
        <SummaryItem label="Productos con stock" value={inventory.totalElements} />
        <SummaryItem label="Productos activos" value={inventory.productTotalElements} />
        <SummaryItem label="Stock libre" value={inventory.summary.stockFree} />
        <SummaryItem label="Bajo stock" value={inventory.summary.lowStock} />
      </div>

      <div className="inventory-grid">
        <InventoryCreateForm inventory={inventory} />
        <InventoryList inventory={inventory} />
      </div>

      <div className="inventory-grid inventory-grid-wide">
        <ProductAdminPanel inventory={inventory} />
        <InventoryOperationsPanel inventory={inventory} />
      </div>
    </section>
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
      <div className="inventory-card-heading">
        <h3>Nuevo producto</h3>
        <p>El backend asigna autom&aacute;ticamente el siguiente SKU.</p>
      </div>

      <div className="sku-preview">
        <span>Pr&oacute;ximo SKU</span>
        <strong>{inventory.nextSku || 'Se asigna al guardar'}</strong>
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
          label="Categor&iacute;a"
          name="category"
          onChange={inventory.handleProductChange}
          placeholder="Electr&oacute;nica"
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
          label="Stock disponible"
          min="0"
          name="stockAvailable"
          onChange={inventory.handleProductChange}
          placeholder="0"
          type="number"
          value={inventory.productForm.stockAvailable}
        />
        <InventoryField
          label="Stock reservado"
          min="0"
          name="stockReserved"
          onChange={inventory.handleProductChange}
          type="number"
          value={inventory.productForm.stockReserved}
        />
        <InventoryField
          label="Punto reposici&oacute;n"
          min="0"
          name="reorderPoint"
          onChange={inventory.handleProductChange}
          type="number"
          value={inventory.productForm.reorderPoint}
        />
      </div>

      <label className="inventory-field inventory-field-wide">
        <span>Descripci&oacute;n</span>
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
      <div className="inventory-card-heading">
        <h3>Stock registrado</h3>
        <p>GET /inventory</p>
      </div>

      <form className="inventory-filters" onSubmit={inventory.applyInventoryFilters}>
        <input
          name="sku"
          onChange={inventory.handleInventoryFilterChange}
          placeholder="Filtrar SKU"
          value={inventory.inventoryFilters.sku}
        />
        <input
          name="warehouseLocation"
          onChange={inventory.handleInventoryFilterChange}
          placeholder="Filtrar bodega"
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
            </tr>
          </thead>
          <tbody>
            {inventory.inventoryItems.length > 0 ? (
              inventory.inventoryItems.map((item) => (
                <InventoryRow item={item} key={item.id || item.productId} />
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  {inventory.isLoading
                    ? 'Cargando inventario...'
                    : 'Presiona Inventario para cargar datos.'}
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
      <div className="inventory-card-heading">
        <h3>Productos</h3>
        <p>GET, PUT y DELETE /inventory/products</p>
      </div>

      <form className="inventory-filters" onSubmit={inventory.applyProductFilters}>
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
          placeholder="Categor&iacute;a"
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

      <div className="inventory-table-wrap">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Categor&iacute;a</th>
              <th>Precio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {inventory.productItems.length > 0 ? (
              inventory.productItems.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category || 'Sin categoria'}</td>
                  <td>{formatMoney(product.unitPrice)}</td>
                  <td>{product.active ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  {inventory.isLoading
                    ? 'Cargando productos...'
                    : 'Presiona Productos para cargar datos.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        currentPage={inventory.productPage}
        onNext={() => inventory.goToProductPage(inventory.productPage + 1)}
        onPrevious={() => inventory.goToProductPage(inventory.productPage - 1)}
        totalPages={inventory.productTotalPages}
      />

      <ProductEditor inventory={inventory} />
    </div>
  )
}

function ProductEditor({ inventory }) {
  return (
    <div className="endpoint-panel">
      <h4>Buscar y editar producto</h4>
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
          <div className="inventory-form-grid">
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
              label="Categor&iacute;a"
              name="category"
              onChange={inventory.handleEditProductChange}
              value={inventory.editProductForm.category}
            />
          </div>
          <label className="inventory-field inventory-field-wide">
            <span>Descripci&oacute;n</span>
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
              Actualizar producto
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
      ) : null}
    </div>
  )
}

function InventoryOperationsPanel({ inventory }) {
  return (
    <div className="inventory-card">
      <div className="inventory-card-heading">
        <h3>Operaciones de stock</h3>
        <p>GET /stock, /availability y POST reserve/release/confirm</p>
      </div>

      <InventoryField
        label="ID producto"
        name="productId"
        onChange={inventory.handleOperationChange}
        placeholder="UUID del producto"
        value={inventory.operationForm.productId}
      />

      <div className="endpoint-actions">
        <button className="inventory-ghost-button" onClick={inventory.handleInventoryDetail} type="button">
          Ver inventario
        </button>
        <button className="inventory-ghost-button" onClick={inventory.handleStockDetail} type="button">
          Ver stock
        </button>
      </div>

      <form className="inventory-form compact-form" onSubmit={inventory.handleInventoryUpdate}>
        <div className="inventory-form-grid">
          <InventoryField
            label="Stock disponible"
            min="0"
            name="stockAvailable"
            onChange={inventory.handleOperationChange}
            type="number"
            value={inventory.operationForm.stockAvailable}
          />
          <InventoryField
            label="Stock reservado"
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
            label="Punto reposici&oacute;n"
            min="0"
            name="reorderPoint"
            onChange={inventory.handleOperationChange}
            type="number"
            value={inventory.operationForm.reorderPoint}
          />
        </div>
        <button className="inventory-primary-button" disabled={inventory.isSaving} type="submit">
          Actualizar inventario
        </button>
      </form>

      <div className="stock-operation-row">
        <InventoryField
          label="Cantidad operaci&oacute;n"
          min="1"
          name="quantity"
          onChange={inventory.handleOperationChange}
          type="number"
          value={inventory.operationForm.quantity}
        />
        <div className="endpoint-actions">
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
          label="Cantidad disponibilidad"
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

      {inventory.operationResult ? (
        <div className="operation-result">
          <strong>{inventory.operationResult.title}</strong>
          <pre>{JSON.stringify(inventory.operationResult.data, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}

function InventoryRow({ item }) {
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
    </tr>
  )
}

function Pagination({ canGoBack, canGoNext, currentPage, onNext, onPrevious, totalPages }) {
  return (
    <div className="inventory-pagination">
      <span>
        P&aacute;gina {totalPages === 0 ? 0 : currentPage + 1} de {totalPages}
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
