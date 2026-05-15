import { useEffect, useState } from 'react'
import {
  checkStockAvailability,
  confirmStock,
  createProduct,
  deleteProduct,
  fetchInventory,
  fetchInventoryByProductId,
  fetchNextSku,
  fetchProductById,
  fetchProductBySku,
  fetchProducts,
  fetchStockByProductId,
  releaseStock,
  reserveStock,
  updateProduct,
  updateProductInventory,
} from '../services/inventoryService'

const PAGE_SIZE = 10

const INITIAL_INVENTORY_FILTERS = {
  sku: '',
  warehouseLocation: '',
  lowStock: '',
}

const INITIAL_PRODUCT_FILTERS = {
  sku: '',
  name: '',
  category: '',
}

const INITIAL_PRODUCT_FORM = {
  name: '',
  description: '',
  unitPrice: '',
  category: '',
  stockAvailable: '',
  stockReserved: '0',
  warehouseLocation: '',
  reorderPoint: '0',
}

const INITIAL_PRODUCT_LOOKUP = {
  productId: '',
  sku: '',
}

const INITIAL_EDIT_PRODUCT_FORM = {
  id: '',
  sku: '',
  name: '',
  description: '',
  unitPrice: '',
  category: '',
  active: true,
}

const INITIAL_OPERATION_FORM = {
  productId: '',
  quantity: '1',
  availabilityQuantity: '1',
  stockAvailable: '',
  stockReserved: '0',
  warehouseLocation: '',
  reorderPoint: '0',
}

/*
 * Hook de orquestacion para el panel admin de inventario.
 * Mantiene separados el estado de UI y las llamadas al gateway.
 */
export function useInventoryAdmin(session) {
  const [inventoryFilters, setInventoryFilters] = useState(INITIAL_INVENTORY_FILTERS)
  const [productFilters, setProductFilters] = useState(INITIAL_PRODUCT_FILTERS)
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM)
  const [productLookup, setProductLookup] = useState(INITIAL_PRODUCT_LOOKUP)
  const [editProductForm, setEditProductForm] = useState(INITIAL_EDIT_PRODUCT_FORM)
  const [operationForm, setOperationForm] = useState(INITIAL_OPERATION_FORM)
  const [inventoryPage, setInventoryPage] = useState(null)
  const [productsPage, setProductsPage] = useState(null)
  const [page, setPage] = useState(0)
  const [productPage, setProductPage] = useState(0)
  const [nextSku, setNextSku] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [operationResult, setOperationResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const inventoryItems = inventoryPage?.content || []
  const productItems = productsPage?.content || []
  const totalElements = inventoryPage?.totalElements || 0
  const totalPages = inventoryPage?.totalPages || 0
  const productTotalElements = productsPage?.totalElements || 0
  const productTotalPages = productsPage?.totalPages || 0
  const summary = calculateSummary(inventoryItems)

  useEffect(() => {
    if (!session?.token) {
      return
    }

    loadDashboard()
    // La carga inicial depende solo del token de sesion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token])

  async function loadDashboard() {
    if (!session?.token) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const [inventoryResponse, productsResponse] = await Promise.all([
        fetchInventory({
          filters: inventoryFilters,
          page,
          size: PAGE_SIZE,
          token: session.token,
        }),
        fetchProducts({
          filters: productFilters,
          page: productPage,
          size: PAGE_SIZE,
          token: session.token,
        }),
      ])
      setInventoryPage(inventoryResponse)
      setProductsPage(productsResponse)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadInventory(nextPage = page, nextFilters = inventoryFilters) {
    if (!session?.token) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetchInventory({
        filters: nextFilters,
        page: nextPage,
        size: PAGE_SIZE,
        token: session.token,
      })
      setInventoryPage(response)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadProducts(nextPage = productPage, nextFilters = productFilters) {
    if (!session?.token) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetchProducts({
        filters: nextFilters,
        page: nextPage,
        size: PAGE_SIZE,
        token: session.token,
      })
      setProductsPage(response)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadNextSku() {
    setErrorMessage('')

    try {
      const response = await fetchNextSku({ token: session.token })
      setNextSku(response.sku)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  function handleInventoryFilterChange(event) {
    const { name, value } = event.target

    setInventoryFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function handleProductFilterChange(event) {
    const { name, value } = event.target

    setProductFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function handleProductChange(event) {
    const { name, value } = event.target

    setProductForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function handleLookupChange(event) {
    const { name, value } = event.target

    setProductLookup((currentLookup) => ({
      ...currentLookup,
      [name]: value,
    }))
  }

  function handleEditProductChange(event) {
    const { checked, name, type, value } = event.target

    setEditProductForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleOperationChange(event) {
    const { name, value } = event.target

    setOperationForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function applyInventoryFilters(event) {
    event.preventDefault()
    setPage(0)
    loadInventory(0, inventoryFilters)
  }

  function clearInventoryFilters() {
    setInventoryFilters(INITIAL_INVENTORY_FILTERS)
    setPage(0)
    loadInventory(0, INITIAL_INVENTORY_FILTERS)
  }

  function applyProductFilters(event) {
    event.preventDefault()
    setProductPage(0)
    loadProducts(0, productFilters)
  }

  function clearProductFilters() {
    setProductFilters(INITIAL_PRODUCT_FILTERS)
    setProductPage(0)
    loadProducts(0, INITIAL_PRODUCT_FILTERS)
  }

  function goToPage(nextPage) {
    setPage(nextPage)
    loadInventory(nextPage, inventoryFilters)
  }

  function goToProductPage(nextPage) {
    setProductPage(nextPage)
    loadProducts(nextPage, productFilters)
  }

  async function handleCreateProduct(event) {
    event.preventDefault()

    const validationMessage = validateProductForm(productForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      setSuccessMessage('')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // El SKU no se envia: inventario genera SKU-000001, SKU-000002, etc.
      const createdProduct = await createProduct({
        product: buildProductPayload(productForm),
        token: session.token,
      })

      await updateProductInventory({
        productId: createdProduct.id,
        inventory: buildInventoryPayload(productForm),
        token: session.token,
      })

      setProductForm(INITIAL_PRODUCT_FORM)
      setNextSku('')
      setSuccessMessage(`Producto creado correctamente con SKU ${createdProduct.sku}.`)
      setPage(0)
      setProductPage(0)
      await loadInventory(0, inventoryFilters)
      await loadProducts(0, productFilters)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function searchProductById() {
    const productId = productLookup.productId.trim()
    if (!productId) {
      setErrorMessage('Ingresa el ID del producto.')
      return
    }

    await loadProduct(() => fetchProductById({ productId, token: session.token }))
  }

  async function searchProductBySku() {
    const sku = productLookup.sku.trim()
    if (!sku) {
      setErrorMessage('Ingresa el SKU del producto.')
      return
    }

    await loadProduct(() => fetchProductBySku({ sku, token: session.token }))
  }

  async function handleUpdateProduct(event) {
    event.preventDefault()

    if (!editProductForm.id) {
      setErrorMessage('Busca un producto antes de actualizar.')
      return
    }

    const validationMessage = validateEditProductForm(editProductForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const updatedProduct = await updateProduct({
        productId: editProductForm.id,
        product: buildEditProductPayload(editProductForm),
        token: session.token,
      })
      setSelectedProduct(updatedProduct)
      setEditProductForm(mapProductToEditForm(updatedProduct))
      setSuccessMessage('Producto actualizado correctamente.')
      await loadProducts(productPage, productFilters)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteProduct() {
    if (!editProductForm.id) {
      setErrorMessage('Busca un producto antes de desactivarlo.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteProduct({ productId: editProductForm.id, token: session.token })
      setSelectedProduct(null)
      setEditProductForm(INITIAL_EDIT_PRODUCT_FORM)
      setSuccessMessage('Producto desactivado correctamente.')
      await loadProducts(productPage, productFilters)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleInventoryDetail() {
    await runOperation('Inventario del producto', () =>
      fetchInventoryByProductId({
        productId: operationForm.productId.trim(),
        token: session.token,
      }),
    )
  }

  async function handleStockDetail() {
    await runOperation('Stock del producto', () =>
      fetchStockByProductId({
        productId: operationForm.productId.trim(),
        token: session.token,
      }),
    )
  }

  async function handleAvailabilityCheck() {
    const quantity = Number(operationForm.availabilityQuantity)
    if (!validatePositiveQuantity(quantity)) {
      setErrorMessage('Ingresa una cantidad valida para disponibilidad.')
      return
    }

    await runOperation('Disponibilidad', () =>
      checkStockAvailability({
        productId: operationForm.productId.trim(),
        quantity,
        token: session.token,
      }),
    )
  }

  async function handleInventoryUpdate(event) {
    event.preventDefault()

    const validationMessage = validateInventoryOperationForm(operationForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    await runOperation('Inventario actualizado', () =>
      updateProductInventory({
        productId: operationForm.productId.trim(),
        inventory: buildInventoryPayload(operationForm),
        token: session.token,
      }),
    )
    await loadInventory(page, inventoryFilters)
  }

  async function handleReserveStock() {
    await runStockMutation('Stock reservado', reserveStock)
  }

  async function handleReleaseStock() {
    await runStockMutation('Stock liberado', releaseStock)
  }

  async function handleConfirmStock() {
    await runStockMutation('Stock confirmado', confirmStock)
  }

  async function loadProduct(requestFactory) {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const product = await requestFactory()
      setSelectedProduct(product)
      setEditProductForm(mapProductToEditForm(product))
      setOperationForm((currentForm) => ({
        ...currentForm,
        productId: product.id,
      }))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function selectProductForEdit(product) {
    setSelectedProduct(product)
    setEditProductForm(mapProductToEditForm(product))
    setProductLookup((currentLookup) => ({
      ...currentLookup,
      productId: product.id || '',
      sku: product.sku || '',
    }))
    setOperationForm((currentForm) => ({
      ...currentForm,
      productId: product.id || currentForm.productId,
    }))
    setSuccessMessage(`Producto ${product.sku} seleccionado para editar.`)
    setErrorMessage('')
  }

  function selectInventoryForStock(item) {
    const productId = item.productId || item.id || ''

    setOperationForm((currentForm) => ({
      ...currentForm,
      productId,
      stockAvailable: String(item.stockAvailable ?? ''),
      stockReserved: String(item.stockReserved ?? '0'),
      warehouseLocation: item.warehouseLocation || '',
      reorderPoint: String(item.reorderPoint ?? '0'),
    }))
    setOperationResult({
      title: `Stock ${item.sku}`,
      data: item,
    })
    setSuccessMessage(`Inventario ${item.sku} seleccionado para operar stock.`)
    setErrorMessage('')
  }

  async function runOperation(title, requestFactory) {
    const productId = operationForm.productId.trim()
    if (!productId) {
      setErrorMessage('Ingresa el ID del producto para la operacion.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const data = await requestFactory()
      setOperationResult({ title, data })
      setSuccessMessage(`${title} ejecutado correctamente.`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function runStockMutation(title, operation) {
    const quantity = Number(operationForm.quantity)
    if (!validatePositiveQuantity(quantity)) {
      setErrorMessage('Ingresa una cantidad valida para la operacion de stock.')
      return
    }

    await runOperation(title, () =>
      operation({
        productId: operationForm.productId.trim(),
        quantity,
        token: session.token,
      }),
    )
    await loadInventory(page, inventoryFilters)
  }

  return {
    applyInventoryFilters,
    applyProductFilters,
    clearInventoryFilters,
    clearProductFilters,
    editProductForm,
    errorMessage,
    goToPage,
    goToProductPage,
    handleAvailabilityCheck,
    handleConfirmStock,
    handleCreateProduct,
    handleDeleteProduct,
    handleEditProductChange,
    handleInventoryDetail,
    handleInventoryFilterChange,
    handleInventoryUpdate,
    handleLookupChange,
    handleOperationChange,
    handleProductChange,
    handleProductFilterChange,
    handleReleaseStock,
    handleReserveStock,
    searchProductById,
    searchProductBySku,
    selectInventoryForStock,
    selectProductForEdit,
    handleStockDetail,
    handleUpdateProduct,
    inventoryFilters,
    inventoryItems,
    isLoading,
    isSaving,
    loadDashboard,
    loadInventory,
    loadNextSku,
    loadProducts,
    nextSku,
    operationForm,
    operationResult,
    page,
    productFilters,
    productForm,
    productItems,
    productLookup,
    productPage,
    productTotalElements,
    productTotalPages,
    selectedProduct,
    successMessage,
    summary,
    totalElements,
    totalPages,
  }
}

function calculateSummary(inventoryItems) {
  return inventoryItems.reduce(
    (currentSummary, item) => {
      const freeStock = item.stockAvailable - item.stockReserved

      return {
        lowStock:
          item.stockAvailable <= item.reorderPoint
            ? currentSummary.lowStock + 1
            : currentSummary.lowStock,
        reserved: currentSummary.reserved + item.stockReserved,
        stockFree: currentSummary.stockFree + freeStock,
      }
    },
    { lowStock: 0, reserved: 0, stockFree: 0 },
  )
}

function buildProductPayload(form) {
  return {
    sku: null,
    name: form.name.trim(),
    description: normalizeOptionalText(form.description),
    unitPrice: Number(form.unitPrice),
    category: normalizeOptionalText(form.category),
  }
}

function buildEditProductPayload(form) {
  return {
    sku: form.sku.trim(),
    name: form.name.trim(),
    description: normalizeOptionalText(form.description),
    unitPrice: Number(form.unitPrice),
    category: normalizeOptionalText(form.category),
    active: form.active,
  }
}

function buildInventoryPayload(form) {
  return {
    stockAvailable: Number(form.stockAvailable),
    stockReserved: Number(form.stockReserved),
    warehouseLocation: normalizeOptionalText(form.warehouseLocation),
    reorderPoint: Number(form.reorderPoint),
  }
}

function mapProductToEditForm(product) {
  return {
    id: product.id,
    sku: product.sku || '',
    name: product.name || '',
    description: product.description || '',
    unitPrice: String(product.unitPrice ?? ''),
    category: product.category || '',
    active: Boolean(product.active),
  }
}

function normalizeOptionalText(value) {
  const normalized = value.trim()
  return normalized ? normalized : null
}

function validateProductForm(form) {
  const stockAvailable = Number(form.stockAvailable)
  const stockReserved = Number(form.stockReserved)
  const reorderPoint = Number(form.reorderPoint)
  const unitPrice = Number(form.unitPrice)

  if (!form.name.trim()) {
    return 'Ingresa el nombre del producto.'
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    return 'Ingresa un precio unitario valido.'
  }

  if (!Number.isInteger(stockAvailable) || stockAvailable < 0) {
    return 'Ingresa stock disponible valido.'
  }

  if (!Number.isInteger(stockReserved) || stockReserved < 0) {
    return 'Ingresa stock reservado valido.'
  }

  if (stockReserved > stockAvailable) {
    return 'El stock reservado no puede superar el disponible.'
  }

  if (!Number.isInteger(reorderPoint) || reorderPoint < 0) {
    return 'Ingresa un punto de reposicion valido.'
  }

  return ''
}

function validateEditProductForm(form) {
  const unitPrice = Number(form.unitPrice)

  if (!form.sku.trim()) {
    return 'El SKU del producto no puede quedar vacio.'
  }

  if (!form.name.trim()) {
    return 'Ingresa el nombre del producto.'
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    return 'Ingresa un precio unitario valido.'
  }

  return ''
}

function validateInventoryOperationForm(form) {
  const stockAvailable = Number(form.stockAvailable)
  const stockReserved = Number(form.stockReserved)
  const reorderPoint = Number(form.reorderPoint)

  if (!form.productId.trim()) {
    return 'Ingresa el ID del producto.'
  }

  if (!Number.isInteger(stockAvailable) || stockAvailable < 0) {
    return 'Ingresa stock disponible valido.'
  }

  if (!Number.isInteger(stockReserved) || stockReserved < 0) {
    return 'Ingresa stock reservado valido.'
  }

  if (stockReserved > stockAvailable) {
    return 'El stock reservado no puede superar el disponible.'
  }

  if (!Number.isInteger(reorderPoint) || reorderPoint < 0) {
    return 'Ingresa un punto de reposicion valido.'
  }

  return ''
}

function validatePositiveQuantity(quantity) {
  return Number.isInteger(quantity) && quantity > 0
}
